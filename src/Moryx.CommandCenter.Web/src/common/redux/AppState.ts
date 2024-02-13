/*
 * Copyright (c) 2020, Phoenix Contact GmbH & Co. KG
 * Licensed under the Apache License, Version 2.0
*/

import { DatabaseState, getDatabaseReducer, initialDatabaseState } from "../../databases/redux/DatabaseState";
import { getLogReducer, initialLogState, LogState } from "../../log/redux/LogState";
import { getModulesReducer, initialModulesState, ModulesState } from "../../modules/redux/ModulesState";
import { CommonState, getCommonReducer, initialCommonState } from "./CommonState";
import { ActionType } from "./Types";

export interface AppState {
    Common: CommonState;
    Modules: ModulesState;
    Databases: DatabaseState;
    Log: LogState;
}

export const initialAppState: AppState = {
    Common: initialCommonState,
    Modules: initialModulesState,
    Databases: initialDatabaseState,
    Log: initialLogState,
};

export function getAppReducer(state: AppState = initialAppState, action: ActionType<{}>): AppState {
    return {
        Common: getCommonReducer(state.Common, action),
        Modules: getModulesReducer(state.Modules, action),
        Databases: getDatabaseReducer(state.Databases, action),
        Log: getLogReducer(state.Log, action),
    };
}
