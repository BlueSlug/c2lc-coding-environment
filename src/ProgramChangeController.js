// @flow

import type {IntlShape} from 'react-intl';
import type {AudioManager} from './types';
import {App} from './App';
import {ProgramBlockEditor} from './ProgramBlockEditor';

// The ProgramChangeController is responsible for making changes to the
// App 'state.programSequence' and coordinating any user interface
// activities associated with the change, such as making announcements,
// setting focus, or setting up animations.

export default class ProgramChangeController {
    app: App;
    intl: IntlShape;
    audioManager: AudioManager;

    constructor(app: App, intl: IntlShape, audioManager: AudioManager) {
        this.app = app;
        this.intl = intl;
        this.audioManager = audioManager;
    }

    insertSelectedActionIntoProgram(programBlockEditor: ?ProgramBlockEditor,
        index: number, selectedAction: ?string) {

        this.app.setState((state) => {
            if (selectedAction) {
                this.playAnnouncementForAdd(selectedAction);
                this.doActivitiesForAdd(programBlockEditor, index);
                return {
                    programSequence: state.programSequence.insertStep(index,
                        selectedAction)
                };
            } else {
                return {};
            }
        });
    }

    addSelectedActionToProgramEnd(programBlockEditor: ?ProgramBlockEditor,
        selectedAction: ?string) {

        this.app.setState((state) => {
            if (selectedAction) {
                this.playAnnouncementForAdd(selectedAction);
                const index = state.programSequence.getProgramLength();
                this.doActivitiesForAdd(programBlockEditor, index);
                return {
                    programSequence: state.programSequence.insertStep(index,
                        selectedAction)
                };
            } else {
                return {};
            }
        });
    }

    deleteProgramStep(programBlockEditor: ?ProgramBlockEditor,
        index: number, command: string) {

        this.app.setState((state) => {
            // Check that the step to delete hasn't changed since the
            // user made the deletion
            if (command === state.programSequence.getProgramStepAt(index)) {
                // Play the announcement
                const commandString = this.intl.formatMessage({
                    id: "Announcement." + command
                });
                this.audioManager.playAnnouncement(
                    'delete',
                    this.intl,
                    { command: commandString }
                );

                // If there are steps following the one being deleted, focus
                // the next step. Otherwise, focus the final add node.
                if (programBlockEditor) {
                    if (index < state.programSequence.getProgramLength() - 1) {
                        programBlockEditor.focusCommandBlockAfterUpdate(index);
                    } else {
                        programBlockEditor.focusAddNodeAfterUpdate(index);
                    }
                }

                return {
                    programSequence: state.programSequence.deleteStep(index)
                };
            } else {
                // If the step to delete has changed, make no changes to the
                // program
                return {};
            }
        });
    }

    // Internal methods

    playAnnouncementForAdd(command: string) {
        const commandString = this.intl.formatMessage({
            id: "Announcement." + (command || "")
        });
        this.audioManager.playAnnouncement(
            'add',
            this.intl,
            { command: commandString }
        );
    }

    doActivitiesForAdd(programBlockEditor: ?ProgramBlockEditor, index: number) {
        // Set up focus, scrolling, and animation
        if (programBlockEditor) {
            programBlockEditor.focusCommandBlockAfterUpdate(index);
            programBlockEditor.scrollToAddNodeAfterUpdate(index + 1);
            programBlockEditor.setUpdatedCommandBlock(index);
        }
    }

};