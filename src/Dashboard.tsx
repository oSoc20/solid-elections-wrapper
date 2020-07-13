import React, {useState, useEffect} from 'react';
import {useWebId} from '@solid/react'
import {fetchDocument, TripleDocument} from 'tripledoc';
import {foaf} from 'rdf-namespaces';
import {initializeDataFolder, addDummyText} from './SolidWrapper';

const Dashboard = () => {
    const webId = useWebId();
    const [name, setName] = useState('undefined');
    const [appContainer, setAppContainer] = useState<TripleDocument>();
    useEffect(() => {
        const getName = async (webId: string) => {
            const profileDoc = await fetchDocument(webId);
            const profile = profileDoc.getSubject(webId);
            setName(profile.getString(foaf.name) || 'undefined');
            const appContainer = await initializeDataFolder(profile);
            if (appContainer != null) {
                setAppContainer(appContainer);
            } else {
                console.error("PANIC: We couldn't acces the app folder on the Solid Pod.");
            }
        };
        if (typeof webId === 'string') {
            getName(webId);
        }
    }, [webId]);

    return (
        <>
            <h1>You are connected 🎉</h1>
            <p>Welcome back, {name}</p>
            <button onClick={() => {
                if (appContainer) {
                    addDummyText(appContainer);
                }
            }}>Add a dummy Person</button>
        </>
    );
};

export default Dashboard;

