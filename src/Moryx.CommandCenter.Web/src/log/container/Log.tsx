/*
 * Copyright (c) 2020, Phoenix Contact GmbH & Co. KG
 * Licensed under the Apache License, Version 2.0
*/

import { mdiFormatListBulletedSquare, mdiSquareEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import * as React from "react";
import { connect } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import TreeMenu from "../../common/components/Menu/TreeMenu";
import MenuModel from "../../common/models/MenuModel";
import { AppState } from "../../common/redux/AppState";
import { ActionType } from "../../common/redux/Types";
import LogRestClient from "../api/LogRestClient";
import Logger from "../components/Logger";
import LogMenuItemContent from "../components/LogMenuItemContent";
import LoggerModel from "../models/LoggerModel";
import { LogLevel } from "../models/LogLevel";
import LogMenuItem from "../models/LogMenuItem";
import { updateLoggers } from "../redux/LogActions";

interface LogPropsModel {
    RestClient?: LogRestClient;
    Loggers?: LoggerModel[];
}

interface LogDispatchPropModel {
    onUpdateLoggers?(loggers: LoggerModel[]): void;
}

const mapStateToProps = (state: AppState): LogPropsModel => {
    return {
        RestClient: state.Log.RestClient,
        Loggers: state.Log.Loggers
    };
};

const mapDispatchToProps = (dispatch: React.Dispatch<ActionType<{}>>): LogDispatchPropModel => {
    return {
        onUpdateLoggers: (loggers: LoggerModel[]) => dispatch(updateLoggers(loggers)),
    };
};

interface LogStateModel {
    ActiveTab: string;
    Menu: MenuModel;
    LoggerTabs: LoggerModel[];
}

class Log extends React.Component<LogPropsModel & LogDispatchPropModel, LogStateModel> {

    private overviewLogger: LoggerModel;

    constructor(props: LogPropsModel & LogDispatchPropModel) {
        super(props);
        this.state = { ActiveTab: "0", Menu: { MenuItems: [] }, LoggerTabs: [] };

        this.overviewLogger = new LoggerModel();
        this.overviewLogger.name = "";
    }

    public componentDidMount(): void {
        this.props.RestClient.loggers().then((data) => {
            this.props.onUpdateLoggers(data);
            this.setState({ Menu: { MenuItems: data.map((logger, idx) => this.createMenuItem(logger)) } });
        });
    }

    public createMenuItem(logger: LoggerModel): LogMenuItem {
        const menuItem: LogMenuItem = {
            Name: LoggerModel.shortLoggerName(logger),
            NavPath: "/log",
            Logger: logger,
            SubMenuItems: logger.childLogger.map((childLogger, idx) => this.createMenuItem(childLogger)),
        };

        menuItem.Content = (<LogMenuItemContent Logger={menuItem.Logger}
            onActiveLogLevelChange={this.onActiveLogLevelChange.bind(this)}
            onLabelClicked={this.onMenuItemClicked.bind(this)} />);
        return menuItem;
    }

    private onActiveLogLevelChange(e: React.FormEvent<HTMLInputElement>, logger: LoggerModel): void {
        e.preventDefault();

        const newValue = (e.target as HTMLSelectElement).value as LogLevel;
        this.props.RestClient.logLevel(logger.name, newValue).then((data) => {
            if (data.success) {
                logger.activeLevel = newValue;
                Log.changeActiveLogLevel(logger, newValue);
                this.forceUpdate();
                toast.success("Log level for '" + logger.name + "' was set successfully", { autoClose: 5000 });
            } else {
                toast.error(data.errorMessage, { autoClose: 5000 });
            }
        });
    }

    private static changeActiveLogLevel(logger: LoggerModel, logLevel: LogLevel): void {
        if (logger.activeLevel > logLevel) {
            logger.activeLevel = logLevel;
        }

        for (const childLogger of logger.childLogger) {
            Log.changeActiveLogLevel(childLogger, logLevel);
        }
    }

    private toggleTab(tabName: string): void {
        this.setState({ ActiveTab: tabName });
    }

    private onMenuItemClicked(logger: LoggerModel): void {
        const idx = this.state.LoggerTabs.indexOf(logger);
        if (idx === -1) {
            this.setState((prevState) => ({
                LoggerTabs: [...prevState.LoggerTabs, logger],
                ActiveTab: (prevState.LoggerTabs.length + 1).toString(),
            }));
        } else {
            this.setState({ ActiveTab: (idx + 1).toString() });
        }
    }

    private onCloseTab(logger: LoggerModel): void {
        const idx = this.state.LoggerTabs.indexOf(logger);
        if (idx !== -1) {
            let activeTab = parseInt(this.state.ActiveTab, 10);
            if (activeTab >= this.state.LoggerTabs.length) {
                activeTab -= 1;
            }

            this.setState((prevState) => ({
                LoggerTabs: prevState.LoggerTabs.filter((_, i) => i !== idx),
                ActiveTab: (activeTab).toString(),
            }));
        }
    }

    private preRenderNavForTabs(): React.ReactNode {
        return this.state.LoggerTabs.map((logger, idx) =>
            <NavItem key={idx} className={"selectable"}>
                <NavLink className={this.state.ActiveTab === (idx + 1).toString() ? "active" : ""} onClick={() => { this.toggleTab((idx + 1).toString()); }}>
                    {LoggerModel.shortLoggerName(logger)}
                </NavLink>
            </NavItem>,
        );
    }

    private preRenderTabs(): React.ReactNode {
        return this.state.LoggerTabs.map((logger, idx) =>
            <TabPane key={idx} tabId={(idx + 1).toString()}>
                <Row>
                    <Col md="12">
                        <Logger RestClient={this.props.RestClient} Logger={logger} onCloseTab={this.onCloseTab.bind(this)} />
                    </Col>
                </Row>
            </TabPane>,
        );
    }

    public render(): React.ReactNode {
        return (
            <Row>
                <Col md={3}>
                    <Card>
                        <CardHeader tag="h2">
                            <Icon path={mdiFormatListBulletedSquare} className="icon right-space" />
                            Loggers
                        </CardHeader>
                        <CardBody>
                            <Container fluid={true}>
                                <TreeMenu Menu={this.state.Menu} />
                            </Container>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={9}>
                    <Card>
                        <CardHeader tag="h2">
                            <Icon path={mdiSquareEditOutline} className="icon right-space" />
                            Log
                        </CardHeader>
                        <CardBody>
                            <Nav tabs={true}>
                                <NavItem>
                                    <NavLink className={this.state.ActiveTab === "0" ? "active selectable" : "selectable"} onClick={() => { this.toggleTab("0"); }}>
                                        Overview
                                    </NavLink>
                                </NavItem>
                                {this.preRenderNavForTabs()}
                            </Nav>
                            <TabContent activeTab={this.state.ActiveTab}>
                                <TabPane tabId="0">
                                    <Row>
                                        <Col md="12">
                                            <Logger RestClient={this.props.RestClient} Logger={this.overviewLogger} onCloseTab={null} />
                                        </Col>
                                    </Row>
                                </TabPane>
                                {this.preRenderTabs()}
                            </TabContent>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default connect<LogPropsModel, LogDispatchPropModel>(mapStateToProps, mapDispatchToProps)(Log);
