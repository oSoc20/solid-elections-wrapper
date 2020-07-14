import React, {useState, useEffect} from 'react';
import {useWebId} from '@solid/react'
import {fetchDocument, TripleDocument} from 'tripledoc';
import {foaf} from 'rdf-namespaces';
import {initializeDataFolder, addDummyText} from './SolidWrapper';

const Dashboard: React.FC = () => {
    const webId = useWebId();
    const [name, setName] = useState<string>('undefined');
    const [appContainer, setAppContainer] = useState<TripleDocument>();
    // useEffect is triggered when the state of this component
    useEffect(() => {
        const getName = async (webID: string) => {
            // Fetch the profile document on the solid pod
            const profileDoc = await fetchDocument(webID);
            const profile = profileDoc.getSubject(webID);
            // This try to fetch the name of the Solid Pod user
            // If there is no name in the profile document we use the webID as name
            setName(profile.getString(foaf.name) || webID);
            // Create the application folder
            // The appContainer must be use as a base path for each form submitted
            // to keep all the forms inside the same folder
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
            <p>Open you dev console to see logs</p>
            <p>And check the folder /public/solidelections in you solid pod</p>
            <button onClick={() => {
                if (appContainer) {
                    addDummyText(appContainer);
                }
                console.log("The dummy person file has been added to /public/solidelections/dummyPerson.ttl")
            }}>Add a dummy Person</button>
        </>
    );
};

export default Dashboard;

