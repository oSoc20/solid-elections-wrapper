import React from 'react';
import {AuthButton, LoggedOut, LoggedIn} from '@solid/react'
import Dashboard from './Dashboard';

function App() {
    return (
        <>
            <LoggedOut>
                <div>
                    <h1>You are not logged in 😒</h1>
                </div>
            </LoggedOut>
            <LoggedIn>
                <Dashboard />
            </LoggedIn>
            <AuthButton popup="popup.html" login="Login here!" logout="Log me out" />
        </>
    );
}

export default App;
