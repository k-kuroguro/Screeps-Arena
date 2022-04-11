import { BodyPartConstant } from 'game/constants';
import { Creep } from 'game/prototypes';

export const hasBodyPart = (creep: Creep, type: BodyPartConstant) => creep.body.some(p => p.type === type);
