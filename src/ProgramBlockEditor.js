// @flow

import { Col, Collapse, Container, Row } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import * as ProgramUtils from './ProgramUtils';
import type {Program, SelectedAction} from './types';
import React from 'react';
import ConfirmDeleteAllModal from './ConfirmDeleteAllModal';
import AddNodeButton from './AddNodeButton';
import AriaDisablingButton from './AriaDisablingButton';
import CommandBlock from './CommandBlock';
import classNames from 'classnames';
import { ReactComponent as DeleteIcon } from './svg/Delete.svg';
import { ReactComponent as PlayIcon } from './svg/Play.svg';
import './ProgramBlockEditor.scss';

// TODO: Send focus to Delete toggle button on close of Delete All confirmation dialog

type ProgramBlockEditorProps = {
    intl: any,
    activeProgramStepNum: ?number,
    editingDisabled: boolean,
    interpreterIsRunning: boolean,
    program: Program,
    // $FlowFixMe
    selectedAction: SelectedAction,
    runButtonDisabled: boolean,
    addModeDescriptionId: string,
    deleteModeDescriptionId: string,
    onClickRunButton: () => void,
    onSelectAction: (selectedAction: SelectedAction) => void,
    onChange: (Program) => void
};

type ProgramBlockEditorState = {
    showConfirmDeleteAll: boolean
};

class ProgramBlockEditor extends React.Component<ProgramBlockEditorProps, ProgramBlockEditorState> {
    commandBlockRefs: Map<number, HTMLElement>;
    focusIndex: ?number;
    scrollToIndex: ?number;

    constructor(props: ProgramBlockEditorProps) {
        super(props);
        this.commandBlockRefs = new Map();
        this.focusIndex = null;
        this.scrollToIndex = null;
        this.state = {
            showConfirmDeleteAll : false
        }
    }

    toggleAction(action: 'delete') {
        if (this.props.selectedAction
                && this.props.selectedAction.type === 'editorAction'
                && this.props.selectedAction.action === action) {
            this.props.onSelectAction(null);
        } else {
            this.props.onSelectAction({
                type: 'editorAction',
                action: action
            });
        }
    };

    actionIsSelected(action: string) {
        return (this.props.selectedAction
            && this.props.selectedAction.type === 'editorAction'
            && this.props.selectedAction.action === action);
    }

    deleteIsSelected() {
        return this.actionIsSelected('delete');
    }

    commandIsSelected() {
        return (this.props.selectedAction
            && this.props.selectedAction.type === 'command');
    }

    getSelectedCommandName() {
        if (this.commandIsSelected()) {
            return this.props.selectedAction.commandName;
        }
    }

    handleClickDelete = () => {
        this.toggleAction('delete');
    };

    handleClickDeleteAll = () => {
        this.setState({
            showConfirmDeleteAll : true
        });
    }

    handleCancelDeleteAll = () => {
        this.setState({
            showConfirmDeleteAll : false
        });
    }

    handleConfirmDeleteAll = () => {
        this.props.onChange([]);
        this.setState({
            showConfirmDeleteAll : false
        });
    }

    handleClickStep = (e: SyntheticEvent<HTMLButtonElement>) => {
        const index = parseInt(e.currentTarget.dataset.stepnumber, 10);
        const programIndex = index/2;

        if (this.props.selectedAction && this.props.selectedAction.type === 'editorAction') {
            if (this.props.selectedAction.action === 'delete') {
                this.focusIndex = index;
                this.props.onChange(ProgramUtils.trimEnd(
                    ProgramUtils.deleteStep(this.props.program, programIndex),
                    'none'));
                this.scrollToIndex = null;
            }
        }
    };

    handleClickAddButton = (e: SyntheticEvent<HTMLButtonElement>) => {
        if (this.props.selectedAction && this.props.selectedAction.type === 'command') {
            const index = parseInt(e.currentTarget.dataset.stepnumber, 10);
            const programIndex = index/2;
            this.focusIndex = index + 1;
            this.props.onChange(ProgramUtils.insert(this.props.program,
                programIndex, this.props.selectedAction.commandName, 'none'));
            this.scrollToIndex = index + 2;
        }
    };

    hanldeDropCommand = (e: SyntheticDragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        this.handleClickAddButton(e);
    };

    handleSetFocus = (programStepNumber: number) => {
        let element = this.commandBlockRefs.get(programStepNumber);
        if (element) {
            element.focus();
        }
    }

    setCommandBlockRef = (programStepNumber: number, element: ?HTMLElement) => {
        if (element) {
            this.commandBlockRefs.set(programStepNumber, element);
        }
    };

    programIsActive = (programStepNumber: number) => {
        if (this.props.interpreterIsRunning && this.props.activeProgramStepNum) {
            return (this.props.activeProgramStepNum*2+1) === programStepNumber;
        } else {
            return false;
        }
    }

    makeNodeAriaLabel = (programStepNumber: number) => {
        const isLastBlock = (programStepNumber === (this.props.program.length * 2 - 1));
        const programBlockPosition = (programStepNumber + 1)/2;
        if (isLastBlock) {
            if (this.commandIsSelected()) {
                return this.props.intl.formatMessage(
                    {id: 'ProgramBlockEditor.lastBlock'},
                    {
                        command: this.getSelectedCommandName()
                    });
            } else {
                return this.props.intl.formatMessage({id: 'ProgramBlockEditor.blocks.noCommandSelected'});
            }
        } else {
            if (this.commandIsSelected()) {
                return this.props.intl.formatMessage(
                    {id: 'ProgramBlockEditor.betweenBlocks'},
                    {
                        command: this.getSelectedCommandName(),
                        prevCommand: `${programBlockPosition}, ${this.props.program[programBlockPosition-1]}`,
                        postCommand: `${programBlockPosition+1}, ${this.props.program[programBlockPosition]}`
                    });
            } else {
                return this.props.intl.formatMessage({id: 'ProgramBlockEditor.blocks.noCommandSelected'});
            }
        }
    }

    makeProgramBlock(programStepNumber: number, command: string) {
        const active = this.programIsActive(programStepNumber);
        const programBlockPosition = (programStepNumber + 1)/2;

        const classes = classNames(
            'ProgramBlockEditor__program-block',
            active && 'ProgramBlockEditor__program-block--active'
        );
        let ariaLabel = '';
        if (command !== 'addNode') {
            ariaLabel = this.props.intl.formatMessage(
                { id: `ProgramBlockEditor.command.${command}` },
                { index: programBlockPosition }
            );
        }

        if (this.deleteIsSelected()) {
            ariaLabel += `. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnDelete'})}`;
        }

        if (command !== 'addNode') {
            return (
                <CommandBlock
                    commandName={command}
                    ref={ (element) => this.setCommandBlockRef(programStepNumber, element) }
                    key={`${programStepNumber}-${command}`}
                    data-stepnumber={programStepNumber}
                    className={classes}
                    aria-label={ariaLabel}
                    disabled={this.props.editingDisabled}
                    onClick={this.handleClickStep}
                />
            );
        }
    }

    makeProgramBlockSection(programStepNumber: number, command: string) {
        const isLastBlock =
            programStepNumber === (this.props.program.length * 2 - 1);
        return (
            <React.Fragment key={programStepNumber}>
                <div className='ProgramBlockEditor__program-block-connector'/>
                {command !== 'addNode' ?
                    <React.Fragment>
                        {this.makeProgramBlock(programStepNumber, command)}
                        <div className='ProgramBlockEditor__program-block-connector' />
                        <AddNodeButton
                            aria-label={this.makeNodeAriaLabel(programStepNumber)}
                            ref={ (element) => this.setCommandBlockRef(programStepNumber+1, element) }
                            showButton={isLastBlock}
                            commandSelected={this.commandIsSelected()}
                            programStepNumber={programStepNumber+1}
                            disabled={
                                this.props.editingDisabled ||
                                !this.commandIsSelected()}
                            onClick={this.handleClickAddButton}
                            onDrop={this.hanldeDropCommand}
                            onFocus={this.handleSetFocus}
                        />
                    </React.Fragment> :
                    <AddNodeButton
                        aria-label={
                            this.commandIsSelected() ?
                            this.props.intl.formatMessage(
                            { id: 'ProgramBlockEditor.beginningBlock' },
                            { command: this.getSelectedCommandName() }) :
                            this.props.intl.formatMessage(
                            {id: 'ProgramBlockEditor.blocks.noCommandSelected'})}
                        ref={ (element) => this.setCommandBlockRef(programStepNumber, element) }
                        commandBlockRefs = {this.commandBlockRefs}
                        showButton={this.props.program.length === 0}
                        commandSelected={this.commandIsSelected()}
                        programStepNumber={programStepNumber}
                        disabled={
                            this.props.editingDisabled ||
                            !this.commandIsSelected()}
                        onClick={this.handleClickAddButton}
                        onDrop={this.hanldeDropCommand}
                        onFocus={this.handleSetFocus}
                    />
                }
            </React.Fragment>
        );
    }

    render() {
        const contents = this.props.program.map((command, stepNumber) => {
            const commandStepNumber = stepNumber * 2 + 1;
            return this.makeProgramBlockSection(commandStepNumber, command);
        });

        // Ensure that the add node is always at the beginning
        contents.unshift(this.makeProgramBlockSection(0, 'addNode'));

        return (
            <Container className='ProgramBlockEditor__container'>
                <Row className='ProgramBlockEditor__header'>
                    <Col>
                        <h2 className='ProgramBlockEditor__heading'>
                            <FormattedMessage id='ProgramBlockEditor.programHeading' />
                        </h2>
                    </Col>
                    <div className='ProgramBlockEditor__editor-actions'>
                        <AriaDisablingButton
                            aria-label={this.props.intl.formatMessage({id:'ProgramBlockEditor.editorAction.delete'})}
                            aria-describedby={this.props.deleteModeDescriptionId}
                            className={this.deleteIsSelected() ?
                                        'ProgramBlockEditor__editor-action-button ProgramBlockEditor__editor-action-button--pressed' :
                                        'ProgramBlockEditor__editor-action-button'}
                            disabledClassName='ProgramBlockEditor__editor-action-button--disabled'
                            disabled={this.props.editingDisabled}
                            onClick={this.handleClickDelete}
                            aria-pressed={this.deleteIsSelected() ? 'true' : 'false'}
                            key='deleteButton'
                        >
                            <DeleteIcon className='ProgramBlockEditor__editor-action-button-svg'/>
                        </AriaDisablingButton>
                    </div>
                </Row>
                <Row className='ProgramBlockEditor__delete-all-button-container'>
                    <Collapse in={this.deleteIsSelected()}>
                        <AriaDisablingButton
                            aria-label={this.props.intl.formatMessage({id:'ProgramBlockEditor.deleteAll'})}
                            className={'ProgramBlockEditor__delete-all-button'}
                            disabledClassName='ProgramBlockEditor__delete-all-button--disabled'
                            disabled={this.props.editingDisabled}
                            onClick={this.handleClickDeleteAll}
                        >
                            <FormattedMessage id='ProgramBlockEditor.deleteAll' />
                        </AriaDisablingButton>
                    </Collapse>
                </Row>
                <Row>
                    <Col className='ProgramBlockEditor__program-sequence-scroll-container'>
                        <div className='ProgramBlockEditor__program-sequence'>
                            <div className='ProgramBlockEditor__start-indicator'>
                                {this.props.intl.formatMessage({id:'ProgramBlockEditor.startIndicator'})}
                            </div>
                            {contents}
                        </div>
                    </Col>
                </Row>
                <Row className='ProgramBlockEditor__footer'>
                    <Col>
                        <AriaDisablingButton
                            aria-label={`${this.props.intl.formatMessage({id:'PlayButton.run'})} ${this.props.program.join(' ')}`}
                            className={this.props.interpreterIsRunning ?
                                'ProgramBlockEditor__run-button ProgramBlockEditor__run-button--pressed' :
                                'ProgramBlockEditor__run-button'}
                            disabledClassName='ProgramBlockEditor__run-button--disabled'
                            disabled={this.props.runButtonDisabled}
                            onClick={this.props.onClickRunButton}
                        >
                            <PlayIcon className='ProgramBlockEditor__play-svg' />
                        </AriaDisablingButton>
                    </Col>
                </Row>
                <ConfirmDeleteAllModal
                    show={this.state.showConfirmDeleteAll}
                    onCancel={this.handleCancelDeleteAll}
                    onConfirm={this.handleConfirmDeleteAll}/>
            </Container>
        );
    }

    componentDidUpdate() {
        if (this.scrollToIndex != null) {
            let element = this.commandBlockRefs.get(this.scrollToIndex);
            if (element && element.scrollIntoView) {
                element.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
            }
            this.scrollToIndex = null;
        }
        if (this.focusIndex != null) {
            let element = this.commandBlockRefs.get(this.focusIndex);
            if (element) {
                element.focus();
            }
            this.focusIndex = null;
        }
        if (this.props.activeProgramStepNum != null) {
            let element = this.commandBlockRefs.get(this.props.activeProgramStepNum*2+1);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }
}

export default injectIntl(ProgramBlockEditor);
