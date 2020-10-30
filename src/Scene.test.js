// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import messages from './messages.json';
import Scene from './Scene';
import type {SceneProps} from './Scene';
import CharacterState from './CharacterState';

configure({ adapter: new Adapter() });

const defaultSceneProps = {
    numRows: 1,
    numColumns: 1,
    gridCellWidth: 10,
    characterState: new CharacterState(0, 0, 2, [])
};

function createMountScene(props) {
    const wrapper = mount(
        React.createElement(
            Scene,
            (Object.assign(
                {},
                defaultSceneProps,
                props
            ):SceneProps)
        ),
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale: 'en',
                defaultLocale: 'en',
                messages: messages.en
            }
        }
    );

    return wrapper;
}

function findScene(sceneWrapper) {
    return sceneWrapper.find('.Scene');
}

function findGridLines(sceneWrapper) {
    return sceneWrapper.find('.Scene__grid-line');
}

function findGridLabels(sceneWrapper) {
    return sceneWrapper.find('.Scene__grid-label');
}

function findRobotCharacter(sceneWrapper) {
    return sceneWrapper.find('.RobotCharacter');
}

function findRobotCharacterIcon(sceneWrapper) {
    return sceneWrapper.find('.RobotCharacter__icon');
}

function findRobotCharacterPath(sceneWrapper) {
    return sceneWrapper.find('.Scene__path-line');
}

function calculateGridDimensions(numRows, numColumns, gridCellWidth) {
    const width = numColumns * gridCellWidth;
    const height = numRows * gridCellWidth;
    const minX = -width / 2;
    const minY = -height / 2;
    return { minX, minY, width, height };
}


// TODO: This function is reproducing logic from Scene (the 0.8) and
//       RobotCharacter (everything else) and it will be easily
//       broken. Is there a better approach here that tests that the
//       character is rendered as expected, but it less brittle?
function calculateCharacterDimensions(gridCellWidth) {
    const characterWidth = gridCellWidth * 0.8 * 0.75;
    const x = -characterWidth/2;
    const y = -characterWidth/2;
    const width = characterWidth;
    const height = characterWidth;
    return { x, y, width, height };
}

describe('When the Scene renders', () => {
    test('Aria label should tell there is a robot character with its position', () => {
        const numRows = 9;
        const numColumns = 17;
        const sceneWrapper = createMountScene({numColumns, numRows});
        const scene = findScene(sceneWrapper);
        expect(scene.get(0).props['aria-label']).toBe('Scene, 17 by 9 grid with a robot character at column I, row 5');
    });

    test('With numRows = 0, numColumns = 2, gridCellWidth = 5', () => {
        expect.assertions(1);
        const numRows = 0;
        const numColumns = 2;
        const gridCellWidth = 5;
        const sceneWrapper = createMountScene({numRows, numColumns, gridCellWidth});
        expect(findGridLines(sceneWrapper).length).toBe(0);
    });

    test('With numRows = 2, numColumns = 0, gridCellWidth = 10', () => {
        expect.assertions(1);
        const numRows = 2;
        const numColumns = 0;
        const gridCellWidth = 10;
        const sceneWrapper = createMountScene({numRows, numColumns, gridCellWidth});
        expect(findGridLines(sceneWrapper).length).toBe(0);
    });

    test('With numRows = 1, numColumns = 1, gridCellWidth = 100', () => {
        expect.assertions(7);
        const numRows = 1;
        const numColumns = 1;
        const gridCellWidth = 100;
        const expectedGridDimensions = calculateGridDimensions(numRows, numColumns, gridCellWidth);
        const sceneWrapper = createMountScene({numRows, numColumns, gridCellWidth});
        const expectedLabelOffset = 2.5

        // Scene viewbox

        expect(findScene(sceneWrapper).get(0).props.children.props.viewBox)
            .toBe(`${expectedGridDimensions.minX} ${expectedGridDimensions.minY} ${expectedGridDimensions.width} ${expectedGridDimensions.height}`);

        // Grid labels

        expect(findGridLabels(sceneWrapper).length).toBe(2);

        // Row labels

        expect(findGridLabels(sceneWrapper).get(0).props.x).toBe(-50 - expectedLabelOffset);
        expect(findGridLabels(sceneWrapper).get(0).props.y).toBe(0);

        // Column labels

        expect(findGridLabels(sceneWrapper).get(1).props.x).toBe(0);
        expect(findGridLabels(sceneWrapper).get(1).props.y).toBe(-50 - expectedLabelOffset);

        // Grid lines

        expect(findGridLines(sceneWrapper).length).toBe(0);
    });

    test('With numRows = 2, numColumns = 2, gridCellWidth = 6', () => {
        expect.assertions(19);
        const numRows = 2;
        const numColumns = 2;
        const gridCellWidth = 100;
        const expectedGridDimensions = calculateGridDimensions(numRows, numColumns, gridCellWidth);
        const sceneWrapper = createMountScene({numRows, numColumns, gridCellWidth});
        const expectedLabelOffset = 5

        // Scene viewbox

        expect(findScene(sceneWrapper).get(0).props.children.props.viewBox)
            .toBe(`${expectedGridDimensions.minX} ${expectedGridDimensions.minY} ${expectedGridDimensions.width} ${expectedGridDimensions.height}`);

        // Grid labels

        expect(findGridLabels(sceneWrapper).length).toBe(4);

        // Row labels

        expect(findGridLabels(sceneWrapper).get(0).props.x).toBe(-100 - expectedLabelOffset);
        expect(findGridLabels(sceneWrapper).get(0).props.y).toBe(-50);
        expect(findGridLabels(sceneWrapper).get(1).props.x).toBe(-100 - expectedLabelOffset);
        expect(findGridLabels(sceneWrapper).get(1).props.y).toBe(50);

        // Column labels

        expect(findGridLabels(sceneWrapper).get(2).props.x).toBe(-50);
        expect(findGridLabels(sceneWrapper).get(2).props.y).toBe(-100 - expectedLabelOffset);
        expect(findGridLabels(sceneWrapper).get(3).props.x).toBe(50);
        expect(findGridLabels(sceneWrapper).get(3).props.y).toBe(-100 - expectedLabelOffset);

        // Grid lines

        expect(findGridLines(sceneWrapper).length).toBe(2);

        // Grid rows

        expect(findGridLines(sceneWrapper).get(0).props.x1).toBe(-100);
        expect(findGridLines(sceneWrapper).get(0).props.y1).toBe(0);
        expect(findGridLines(sceneWrapper).get(0).props.x2).toBe(100);
        expect(findGridLines(sceneWrapper).get(0).props.y2).toBe(0);

        // Grid columns

        expect(findGridLines(sceneWrapper).get(1).props.x1).toBe(0);
        expect(findGridLines(sceneWrapper).get(1).props.y1).toBe(-100);
        expect(findGridLines(sceneWrapper).get(1).props.x2).toBe(0);
        expect(findGridLines(sceneWrapper).get(1).props.y2).toBe(100);
    });
});

describe('When the Scene renders', () => {
    test('Should render the robot character component', () => {
        expect.assertions(5);
        const gridCellWidth = 5;
        const sceneWrapper = createMountScene({gridCellWidth});
        const expectedCharacterDimensions = calculateCharacterDimensions(gridCellWidth);
        expect(findRobotCharacterIcon(sceneWrapper).hostNodes().length).toBe(1);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.x)
            .toBe(expectedCharacterDimensions.x);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.y)
            .toBe(expectedCharacterDimensions.y);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.width)
            .toBe(expectedCharacterDimensions.width);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.height)
            .toBe(expectedCharacterDimensions.height);
    });
});

describe('When the robot character renders, transform should apply', () => {
    test('When xPos = 0, yPos = 0, direction = 2', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(0, 0, 2, [])
        });
        const robotCharacter = findRobotCharacter(sceneWrapper);
        expect(robotCharacter.get(0).props.transform)
            .toBe('translate(0 0) rotate(0 0 0)');
    });
    test('When xPos = 100, yPos = 80, direction = 4', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(100, 80, 4, [])
        });
        const robotCharacter = findRobotCharacter(sceneWrapper);
        expect(robotCharacter.get(0).props.transform)
            .toBe('translate(100 80) rotate(90 0 0)');
    });
    test('When xPos = 0, yPos = 90, direction = 0', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(0, 90, 0, [])
        });
        const robotCharacter = findRobotCharacter(sceneWrapper);
        expect(robotCharacter.get(0).props.transform)
            .toBe('translate(0 90) rotate(-90 0 0)');
    });
});

describe('When the Character has a path, it is drawn on the Scene', () => {
    test('When there is no path segment', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(0, 0, 2, [])
        });
        const robotCharacterPath = findRobotCharacterPath(sceneWrapper);
        expect(robotCharacterPath.length).toBe(0);
    });

    test('When there is one path segment', () => {
        expect.assertions(5);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(0, 0, 2, [{x1: 100, y1: 200, x2: 300, y2: 400}])
        });
        const robotCharacterPath = findRobotCharacterPath(sceneWrapper);
        expect(robotCharacterPath.length).toBe(1);
        expect(robotCharacterPath.get(0).props.x1).toBe(100);
        expect(robotCharacterPath.get(0).props.y1).toBe(200);
        expect(robotCharacterPath.get(0).props.x2).toBe(300);
        expect(robotCharacterPath.get(0).props.y2).toBe(400);
    });

    test('When there are two path segments', () => {
        expect.assertions(9);
        const sceneWrapper = createMountScene({
            characterState:
                new CharacterState(0, 0, 2, [
                    {x1: 100, y1: 200, x2: 300, y2: 400},
                    {x1: 500, y1: 600, x2: 700, y2: 800}
                ])
        });
        const robotCharacterPath = findRobotCharacterPath(sceneWrapper);
        expect(robotCharacterPath.length).toBe(2);
        expect(robotCharacterPath.get(0).props.x1).toBe(100);
        expect(robotCharacterPath.get(0).props.y1).toBe(200);
        expect(robotCharacterPath.get(0).props.x2).toBe(300);
        expect(robotCharacterPath.get(0).props.y2).toBe(400);
        expect(robotCharacterPath.get(1).props.x1).toBe(500);
        expect(robotCharacterPath.get(1).props.y1).toBe(600);
        expect(robotCharacterPath.get(1).props.x2).toBe(700);
        expect(robotCharacterPath.get(1).props.y2).toBe(800);
    })
})
