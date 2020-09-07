// @flow

import * as C2lcMath from './C2lcMath';
import type { SceneBounds } from './types';

export default class CharacterState {
    xPos: number; // Positive x is East
    yPos: number; // Positive y is South
    directionDegrees: number; // 0 is North, 90 is East

    constructor(xPos: number, yPos: number, directionDegrees: number) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.directionDegrees = directionDegrees;
    }

    forward(distance: number, bounds: SceneBounds): CharacterState {
        const directionRadians = C2lcMath.degrees2radians(this.directionDegrees);
        const xOffset = Math.sin(directionRadians) * distance;
        const yOffset = Math.cos(directionRadians) * distance;

        return new CharacterState(
            C2lcMath.clamp(this.xPos + xOffset, bounds.minX, bounds.maxX),
            C2lcMath.clamp(this.yPos - yOffset, bounds.minY, bounds.maxY),
            this.directionDegrees
        );
    }

    turnLeft(amountDegrees: number): CharacterState {
        return new CharacterState(
            this.xPos,
            this.yPos,
            C2lcMath.wrap(0, 360, this.directionDegrees - amountDegrees)
        );
    }

    turnRight(amountDegrees: number): CharacterState {
        return new CharacterState(
            this.xPos,
            this.yPos,
            C2lcMath.wrap(0, 360, this.directionDegrees + amountDegrees)
        );
    }
}
