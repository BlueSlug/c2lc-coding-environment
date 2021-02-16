// @flow
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import type {IntlShape} from 'react-intl';

import ActionsMenuToggle from './ActionsMenuToggle';
import ActionsMenuItem from './ActionsMenuItem';

import './ActionsMenu.scss';

import type {ActionToggleRegister} from './types';

type ActionsMenuProps = {
    intl: IntlShape,
    changeHandler?: (event: Event, commandName: string) => void,
    editingDisabled?: boolean,
    // TODO: Flesh this definition out.
    menuItems: {},
    allowedActions: ActionToggleRegister,
    usedActions: ActionToggleRegister
};

type ActionsMenuState = {
    showMenu: boolean
};

class ActionsMenu extends React.Component<ActionsMenuProps, ActionsMenuState> {
    static defaultProps = {
        changeHandler: () => {},
        editingDisabled: false,
        usedActions: {},
        menuItems: {
            forward1: {
                isAllowed: true,
                labelKey: "Command.forward1"
            },
            forward2: {
                isAllowed: true,
                labelKey: "Command.forward2"
            },
            forward3: {
                isAllowed: false,
                labelKey: "Command.forward3"
            },
            left45: {
                isAllowed: true,
                labelKey: "Command.left45"
            },
            left90: {
                isAllowed: true,
                labelKey: "Command.left90"
            },
            left180: {
                isAllowed: false,
                labelKey: "Command.left180"
            },
            right45: {
                isAllowed: true,
                labelKey: "Command.right45"
            },
            right90: {
                isAllowed: true,
                labelKey: "Command.right90"
            },
            right180: {
                isAllowed: false,
                labelKey: "Command.right180"
            }
        }
    }
    constructor (props: ActionsMenuProps) {
        super(props);
        this.state = { showMenu: false };
    }

    render() {
        return (
            <React.Fragment>
                <div className='ActionsMenu__header'>
                    <h2 className='ActionsMenu__header-heading'>
                        <FormattedMessage id='ActionsMenu.title' />
                    </h2>
                    <ActionsMenuToggle
                        className='ActionsMenu__header-toggle'
                        intl={this.props.intl}
                        editingDisabled={!!this.props.editingDisabled}
                        onClick={this.showHideMenu}
                    />

                    { (!this.props.editingDisabled && this.state.showMenu) ? this.generateMenu(): undefined}
                </div>

            </React.Fragment>
        );
    }

    showHideMenu = () => {
        if (!this.props.editingDisabled) {
            this.setState((state) => {
                return { showMenu: !(state.showMenu)}
            });
        }
    }

    generateMenu = () => {
        const actionsMenuItems = [];
        // TODO: Discuss how to evolve this into a deeper structure when we add groups and things other than actions.
        Object.keys(this.props.menuItems).forEach((itemKey) => {
            const isAllowed: boolean = !!this.props.allowedActions[itemKey];
            const isUsed: boolean = !!this.props.usedActions[itemKey];
            // TODO: Add a mechanism for values to come back to us.
            const itemChangeHandler = (event: Event) => {
                if (this.props.changeHandler) {
                    this.props.changeHandler(event, itemKey);
                }
            };
            actionsMenuItems.push(
                <ActionsMenuItem
                    intl={this.props.intl}
                    isAllowed={isAllowed}
                    isUsed={isUsed}
                    itemKey={itemKey}
                    key={itemKey}
                    onChange={itemChangeHandler}
                />
            );
        });
        return (<div className="ActionsMenu__menu">
            {actionsMenuItems}
        </div>);
    }
}

export default injectIntl(ActionsMenu);
