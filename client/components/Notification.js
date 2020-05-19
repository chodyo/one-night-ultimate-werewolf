import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    close: {
        padding: theme.spacing(0.5)
    }
}))

/**
 * Notifications serve as a confirmation mechanism & feedback that comes into the page at the top.
 */
export default function Notification(props) {
    const classes = useStyles()

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
            }}
            open={props.message ? true : false}
            autoHideDuration={6000}
            onClose={() =>props.onClose()}
            ContentProps={{
                'aria-describedby': 'message-id'
            }}
            message={<span id="message-id">{props.message}</span>}
            action={[
                <IconButton
                    key="close"
                    aria-label="close"
                    color="inherit"
                    className={classes.close}
                    onClick={() => {
                        console.debug('Closed this notificaiton');
                        props.onClose();}
                    }
                >
                    <CloseIcon />
                </IconButton>
            ]}
        />
    )
}
Notification.propTypes = {
    /** Message to show. */
    message: PropTypes.string,
    /** Function to call when notification is closed. */
    onClose: PropTypes.func
}