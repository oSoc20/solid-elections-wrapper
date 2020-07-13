import {fetchDocument, createDocument, TripleDocument, TripleSubject} from 'tripledoc';
import {solid, space, rdf, foaf} from 'rdf-namespaces';
import auth from 'solid-auth-client';

// Initialize the app folder in `public/solidelections`
// Return the `TripleDocument` (see https://vincenttunru.gitlab.io/tripledoc/docs/api/interfaces/tripledocument.html)
// corresponding to the app folder.
// This `TripleDocument` is going to be use to store every form submitted by a user.
// This function must be called just after the authentication of the user.
export async function initializeDataFolder(profile: TripleSubject): Promise<TripleDocument | null> {
    //Decide at what URL within the user's Pod the new data folder should be stored
    const publicTypeIndex = await fetchPublicTypeIndex(profile);
    if (publicTypeIndex == null) {
        console.error("Public Type Index was not found inside the user profile");
        return null;
    }
    //Check if an app folder (named container in solid documentation) as already been made.
    const appRef = `${publicTypeIndex.asRef()}#solidelections`;
    const appSubject = publicTypeIndex.findSubject(rdf.type, solid.TypeRegistration);
    if (appSubject != null && appSubject.asRef() === appRef) {
        // The app folder has already been made
        console.log("initializeDataFolder: The application folder was already created")
        // Get the reference to the location of the app folder
        const location = appSubject.getRef(solid.instance);
        if (location) {
            // TODO: Check if the repository is indeed at this location
            // if not we must continue and create a new one at this location
            return await fetchDocument(location);
        }
    }

    // The app folder has not been made yet
    // Therefore we can create it.
    const defaultPath = profile.getRef(space.storage) + 'public/solidelections';
    const appContainer = await createAppFolder(defaultPath);

    // Store a reference to the app folder in the public type index
    const appRegistration = publicTypeIndex.addSubject({"identifier": "solidelections"});
    appRegistration.addRef(rdf.type, solid.TypeRegistration);
    appRegistration.addRef(solid.forClass, solid.instance);
    appRegistration.addRef(solid.instance, appContainer.asRef());
    await publicTypeIndex.save([appRegistration]);
    console.log("initializeDataFolder: The directory of the application has just been created")

    return appContainer;
}

export async function addDummyText(appContainer: TripleDocument) {
    // Create a dummy person inside the app folder just to show how to create a new document
    const personRef = appContainer.asRef() + '/dummyPerson.ttl';
    const personDoc = createDocument(personRef);
    const person = personDoc.addSubject();
    person.addRef(foaf.firstName, "John");
    person.addRef(foaf.lastName, "Smith");
    return await personDoc.save([person]);
}

async function fetchPublicTypeIndex(profile: TripleSubject) {
    const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
    return publicTypeIndexRef ? await fetchDocument(publicTypeIndexRef) : null
}

async function createAppFolder(appFolderPath: string) {
    const split = appFolderPath.lastIndexOf('/');
    const parentFolderPath = appFolderPath.substr(0, split);
    const applicationFolderName = appFolderPath.substr(split + 1);
    // The creation of a folder can be done using a POST request on the Solid Pod
    // Note: the user must be logged in.
    await auth.fetch(parentFolderPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/turtle',
            'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
            'Slug': applicationFolderName
        }
    }).catch(error => console.log('Error: ' + JSON.stringify(error)));
    return fetchDocument(appFolderPath);
}


