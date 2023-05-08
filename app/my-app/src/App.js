import './App.css';
import UsersListComponent from './components/UserList/UsersListComponent.js';
import ModelsListComponent from './components/ModelsListComponent/ModelsListComponent';
import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import ConfrimModal from './components/ConfirmComponent/ConfirmModal';
import AlertDialog from './components/AlertComponent/AlertDialog';
import ConfirmContextProvider from './components/ConfirmComponent/ConfirmContextProvider';
import AlertsContextProvider from './components/AlertComponent/AlertsContextProvider';
import LoginPage from './components/Authentication/LoginPage';
import NavigationBar from './components/NavigationBar/NavigationBar';
import AuthenticationContextProvider from './components/Authentication/AuthenticationContextProvider';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import * as SystemConstants from './constants/SystemConstants';
import ModelHistoryComponent from './components/ModelHistoryComponent/ModelHistoryComponent';
import ModelViewerComponent from './components/ModelViewerComponent/ModelViewerComponent';


function App() {
    return (
        <AlertsContextProvider>
            <ConfirmContextProvider>
                <AuthenticationContextProvider>
                    <Router>
                        <NavigationBar />
                        <ConfrimModal/>
                        <AlertDialog/>
                        <Switch>
                            <Route exact path = {SystemConstants.LOGIN_LINK_PATH}>
                                <LoginPage />
                            </Route>
                            <Route path = {`${SystemConstants.MODEL_VIEWER_PATH}/:modelId`}>
                                <ModelViewerComponent />
                            </Route>
                            <Route exact path = {SystemConstants.HOME_LINK_PATH}>
                                <ModelHistoryComponent />
                            </Route>
                            <ProtectedRoute key = {'user-list'} exact path = {SystemConstants.USERS_LINK_PATH} allowedRoles = {['Admin']}>
                                <UsersListComponent />
                            </ProtectedRoute>
                            <ProtectedRoute key = {'model-list'} exact path = {SystemConstants.MODELS_LINK_PATH} allowedRoles = {['Admin', 'User']}>
                                <ModelsListComponent />
                            </ProtectedRoute>
                            <Route path = '*'>
                                <Redirect to = {{pathname: SystemConstants.HOME_LINK_PATH}} />
                            </Route>
                        </Switch>
                    </Router>
                </AuthenticationContextProvider>
            </ConfirmContextProvider>
        </AlertsContextProvider>
    );
}

export default App;
