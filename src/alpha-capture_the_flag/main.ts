import { getObjectsByPrototype } from 'game/utils';
import { Creep, StructureTower } from 'game/prototypes';
import { ATTACK, RANGED_ATTACK, HEAL, ERR_NOT_IN_RANGE } from 'game/constants';
import { Flag } from 'arena';

const ROLE_FORWARD_HEALER = 'ROLE_FORWARD_HEALER';
const ROLE_FORWARD_ATTACKER = 'ROLE_FORWARD_ATTACKER';
const ROLE_BACKWARD_HEALER = 'ROLE_BACKWARD_HEALER';
const ROLE_BACKWARD_ATTACKER = 'ROLE_BACKWARD_ATTACKER';

let isFirstLoop = true;
let isLeft: boolean;
let roleMap: { [name: string]: string } = {};

export function loop() {
   const creeps = getObjectsByPrototype(Creep);
   const myCreeps = creeps.filter(c => c.my);
   const enemyCreeps = creeps.filter(c => !c.my);

   isFirstLoop && initialize(myCreeps);

   for (const creep of myCreeps) {
      if (creep.body.some(p => p.type === ATTACK)) {
         const enemy = creep.findClosestByPath(enemyCreeps.filter(c => (isLeft ? c.x < 20 : c.x > 80)));
         if (enemy && creep.attack(enemy) === ERR_NOT_IN_RANGE) creep.moveTo(enemy);
      } else if (creep.body.some(p => p.type === RANGED_ATTACK)) {
         const enemy = creep.findClosestByPath(enemyCreeps);
         if (!enemy) {
            const flag = getObjectsByPrototype(Flag).find(f => !f.my);
            flag && creep.moveTo(flag);
         }
         else if (creep.rangedAttack(enemy) === ERR_NOT_IN_RANGE) creep.moveTo(enemy);
      } else if (creep.body.some(p => p.type === HEAL)) {
         const closestCreep = creep.findClosestByPath(myCreeps.filter(c => c.hits < c.hitsMax));
         if (!closestCreep) {
            const cc = creep.findClosestByPath(
               myCreeps.filter(c => c.body.some(p => p.type = RANGED_ATTACK)));
            if (cc) creep.moveTo(cc);
         }
         else if (creep.heal(closestCreep) === ERR_NOT_IN_RANGE) creep.moveTo(closestCreep);
      }
   }

   const towers = getObjectsByPrototype(StructureTower).filter(t => t.my);
   for (const tower of towers) {
      const enemy = tower.findClosestByPath(enemyCreeps);
      if (enemy) tower.attack(enemy);
   }

   isFirstLoop = false;
}

function initialize(creeps: Creep[]) {
   isLeft = creeps[0].x < 50;

   let backwardHealerCount = 0;
   for (const creep of creeps) {
      if (creep.body.some(p => p.type === ATTACK)) {
         roleMap[creep.id] = ROLE_BACKWARD_ATTACKER;
      } else if (creep.body.some(p => p.type === RANGED_ATTACK)) {
         roleMap[creep.id] = ROLE_FORWARD_ATTACKER;
      } else if (creep.body.some(p => p.type === HEAL)) {
         if (backwardHealerCount < 1) {
            roleMap[creep.id] = ROLE_BACKWARD_HEALER;
            backwardHealerCount++;
         } else {
            roleMap[creep.id] = ROLE_FORWARD_HEALER;
         }
      }
   }
}
