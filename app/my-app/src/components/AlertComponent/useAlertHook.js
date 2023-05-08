import  { useContext } from 'react';
import { AlertsContext } from './AlertsContextProvider';
import { ALERT_DISPOSAL_TIME_OUT } from '../../constants/SystemConstants';

const useAlertHook = () => {
    const {alerts, setAlerts} = useContext(AlertsContext) ;

    const removeAlert = (alert) => {
        setAlerts(oldAlerts => {
            return oldAlerts.filter((oldAlert) => oldAlert.id !== alert.id);
        });
    };

    const addAlert = (message) => {
        const messageToAdd = {
            message: message,
            id: new Date().getTime()
        };

        setAlerts(oldAlerts => {
            return [messageToAdd, ...oldAlerts];
        });
        setTimeout(() => {
            removeAlert(messageToAdd);
        }, ALERT_DISPOSAL_TIME_OUT);
    };

    return {alerts, addAlert, removeAlert};

};

export default useAlertHook;
