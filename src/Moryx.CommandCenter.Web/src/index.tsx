/*
 * Copyright (c) 2020, Phoenix Contact GmbH & Co. KG
 * Licensed under the Apache License, Version 2.0
*/

import { red } from "@mui/material/colors";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { createStore } from "redux";
import App from "./common/container/App";
import { AppState, getAppReducer } from "./common/redux/AppState";
import { ActionType } from "./common/redux/Types";

const store = createStore<AppState, ActionType<{}>, any, any>(getAppReducer);

const theme = createTheme({
    palette: {
      primary: {
        main: red[500],
      },
    },
  });

ReactDOM.render(
    <ThemeProvider theme={theme}>
    <Provider store={store}>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider></ThemeProvider>
    ,
    document.getElementById("app"),
);
