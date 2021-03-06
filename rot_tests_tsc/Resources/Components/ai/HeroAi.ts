'use strict';
'atomic component';
import * as triggerEvent from 'atomicTriggerEvent';
import CustomJSComponent from 'CustomJSComponent';
import Entity = require('../common/Entity');
import * as metrics from 'metricsGatherer';
import gameState from '../../Modules/gameState';

class HeroAi extends CustomJSComponent {

    inspectorFields = {
    debug: false,
    sightRadius: 10
    };

    sightRadius: number = 10;
    resolveTurn = null;

    start() {
            this.DEBUG('Registering self with scheduler');
            const level = gameState.getCurrentLevel();
            level.registerActor(this);


            // TODO: we need to unlock the engine here for some reason.  It would be better if there were a less invasive way
            level.engine.unlock();
            level.updateFov(this.getPosition(), this.sightRadius);
    }

    /** Pointer to be called when the action is complete.  The complete promise will overwrite this */
    //onActionComplete = null;

    act() {
        this.DEBUG('contemplating action.');
        triggerEvent.trigger(this.node, 'onActionBegin', this, this.node);

        // we are returning a 'thenable' which tells the scheduler to not move on to the next actor
        // until this actor has completed.  This is overriding the onTurnTaken event on this class with
        // the callback passed to the then method, which means that when this class gets an onTurnTaken
        // event, it will resolve the then.
        // See: http://ondras.github.io/rot.js/manual/#timing/engine for some more information.
        return {
            then: (resolve) => {
                this.DEBUG('starting action.');
                this.setTurnResolver(resolve);
            }
        };
    }

    onActionComplete() {
        // call the callback, notifying the scheduler that we are done
        if (this.resolveTurn) {
            this.DEBUG('resolving action');
            metrics.start('resolveTurn');
            this.resolveTurn();
            metrics.stop('resolveTurn');
        }
    }

    setTurnResolver(resolver) {
        this.DEBUG('Setting turn resolver');
        this.resolveTurn = resolver;
    }

    onTurnTaken() {

        this.deferAction(() => {
            metrics.start('incTurn');
            gameState.getCurrentLevel().incTurn();
            metrics.stop('incTurn');

            metrics.start('updateFov');
            gameState.getCurrentLevel().updateFov(this.getPosition());
            metrics.stop('updateFov');
        });

        triggerEvent.trigger(this.node, 'onActionComplete', this, this.node);
    }

    getPosition() {
        return this.node.getJSComponent<Entity>('Entity').getPosition();
    }

    deferredActions = [];
    deferAction(action) {
        this.deferredActions.push(action);
    }

    update() {
        while (this.deferredActions.length) {
            let action = this.deferredActions.pop();
            action();
        }
    }

    // Action Handlers

    onMoveComplete() {
        triggerEvent.trigger(this.node, 'onTurnTaken', this, this.node);
        gameState.getCurrentLevel().setCameraTarget(this.node);
    }

    onSkipTurn() {
        triggerEvent.trigger(this.node, 'onLogAction', 'Waiting...');
        triggerEvent.trigger(this.node, 'onTurnTaken', this, this.node);
    }

    onDie( /*killerComponent, killerNode*/) {
        this.DEBUG('Killed!');
        gameState.getCurrentLevel().deregisterActor(this);
        gameState.getCurrentLevel().gameOver();
    }

    onHit(hitter, hitterNode) {
        const entityComponent = hitterNode.getJSComponent('Entity');
        triggerEvent.trigger(this.node, 'onLogAction', `You are attacked by ${entityComponent.screenName}`);
    }

    onAttack(targetNode) {
        const entityComponent = targetNode.getJSComponent('Entity');
        this.DEBUG(`Attacked ${targetNode.name}`);
        triggerEvent.trigger(this.node, 'onLogAction', `You attack ${entityComponent.screenName}`);
        triggerEvent.trigger(targetNode, 'onHit', this, this.node);
        // move will handle the turn taken
        // TODO: need to clean up the whole turn taking logic somehow, it could get really messy really quickly.
        // triggerEvent.trigger(this.node, 'onTurnTaken', this, this.node);
    }

    onHandleBump(targetNode) {
        const entityComponent = targetNode.getJSComponent('Entity');
        if (entityComponent.attackable) {
            triggerEvent.trigger(this.node, 'onAttack', targetNode);
        } else if (entityComponent.bumpable) {
            triggerEvent.trigger(targetNode, 'onBump', this, this.node);
            triggerEvent.trigger(this.node, 'onActionComplete', this, this.node);
        }
    }

    onHealthChanged() {
      gameState.getCurrentLevel().updateUi();
    }
}
export = HeroAi;
