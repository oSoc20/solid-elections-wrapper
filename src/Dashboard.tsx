import React, {useState, useEffect} from 'react';
import {useWebId} from '@solid/react'
import {fetchDocument, TripleDocument} from 'tripledoc';
import {foaf} from 'rdf-namespaces';
import {initAppStorage, createAppDocument, listDocuments} from './appStorage'

const Dashboard: React.FC = () => {
    const webId = useWebId();
    const [name, setName] = useState<string>('undefined');
    const [appStorage, setAppStorage] = useState<TripleDocument>();
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
            const appStorage = await initAppStorage(webID, 'app');
            if (appStorage) {
                setAppStorage(appStorage);
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
                if (appStorage) {
                    const doc = createAppDocument(appStorage, 'dummytest.ttl')
                    const person = doc.addSubject();
                    person.addRef(foaf.firstName, 'John');
                    person.addRef(foaf.lastName, 'Smith');
                    doc.save([person]);
                }
            }}>Add a dummy Person</button>
            <button onClick={() => appStorage ? console.log(listDocuments(appStorage)) : null}>List Documents</button>
        </>
    );
};

export default Dashboard;

