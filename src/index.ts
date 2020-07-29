import {fetchDocument, createDocument, TripleDocument, TripleSubject, LocalTripleDocumentForContainer} from 'tripledoc';
import {solid, space, rdf, ldp, schema} from 'rdf-namespaces';
import auth from 'solid-auth-client';

/**
 * Initialize an app directory inside the Solid Pod found at the webID.
 * 
 * @remarks 
 * If `initEmpty` is set to true, your application must have already logged in the user using the package `solid-auth-client`
 * or another package that can login a user
 * To create a document inside the app directory you must use the function `createAppDocument`
 * with the app storage returned by this function.
 *
 * @param webID - WebID of the user that links to a Solid Pod
 * @param appName - Name of the application. This name will also be used to 
 *                  name the directory inside the Solid Pod
 * @param initEmpty - Boolean indicating whether the application folder 
 *                    should be created if it is not on the Solid Pod
 *                    (Note: The user must be logged if set to true)
 *                    
 * @returns appStorage - An app storage that can be used with `createAppDocument` to store documents
 *                       corresponding to the application
 *
 * @default initEmpty = true
 */
export async function initAppStorage(webID: string, appName: string, initEmpty: boolean = true): Promise<TripleDocument> {
    const profileDoc = await fetchDocument(webID);
    const profile = profileDoc.getSubject(webID);
    // Fetch the Public Type Index. This document is where we can "link" the app to an actual folder inside the solid pod
    const publicTypeIndex = await fetchPublicTypeIndex(profile);
    if (publicTypeIndex == null) {
        throw new Error("Initialization error: Public Type Index was not found inside the user profile");
    }
    //Check if an app folder (named container in solid documentation) as already been made.
    const appSubject = await findAppSubject(publicTypeIndex, appName);
    if (appSubject) {
        // The app folder has already been made
        // Get the reference to the location of the app folder
        const location = appSubject.getRef(solid.instance);
        if (location) {
            // TODO: Check if the repository is indeed at this location
            // if not we must continue and create a new one at this location
            return fetchDocument(location);
        }
    }

    if(!initEmpty) {
        throw new Error("Application folder was not found inside the user's Solid Pod")
    }

    // The app folder has not been made yet
    // Therefore we can create it.
    const defaultPath = profile.getRef(space.storage) + `public/${appName}`;
    const appStorage = await createAppFolder(defaultPath);

    // Store a reference to the app folder in the public type index
    await registerAppStorage(publicTypeIndex, appName, defaultPath);
    return appStorage;
}

/**
 * Create a document inside the appStorage.
 *
 * @remarks Note: this document will not be created on the Pod until you call [[save]] on it.
 *
 * 
 * @param appStorage - The app storage created via the function `initAppStorage`
 * @param docName - The actual name of the new document
 *
 * @returns Document - The newly created document
 *
 * @example
 * ```ts
 * // Attention: The user must be logged in to create the new app storage
 * const appStorage = await initAppStorage(webID, 'solidelections');
 * const doc = createAppDocument(appStorage, 'dummyPerson.ttl');
 * const person = doc.addSubject();
 * person.addRef(foaf.firstName, 'John');
 * person.addRef(foaf.lastName, 'Smith');
 * await doc.save([person]);
 * ```
 *
 */
export function createAppDocument(appStorage: TripleDocument, docName: string): LocalTripleDocumentForContainer {
    const documentRef = appStorage.asRef() + `/${docName}`;
    return createDocument(documentRef);
}

/**
 * List all documents inside an appStorage
 *
 * @param appStorage - Application storage created with the function `initAppStorage`
 *
 * @returns string[] - references to documents stored into the app storage
 *
 */
export function listDocuments(appStorage: TripleDocument): string[] {
    return appStorage.findSubjects(rdf.type, ldp.Resource).map(subject => {
        const subjectRef = subject.asRef();
        const split = subject.asRef().lastIndexOf('/');
        const fileName = subjectRef.substr(split + 1);
        return appStorage.asRef() + `/${fileName}`;
    });
}

async function fetchPublicTypeIndex(profile: TripleSubject): Promise<TripleDocument | null> {
    const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
    return publicTypeIndexRef ? await fetchDocument(publicTypeIndexRef) : null
}

async function findAppSubject(publicTypeIndex: TripleDocument, appName: string): Promise<TripleSubject | null> {
    const appRef = `${publicTypeIndex.asRef()}#${appName}`;

    // Remember that everything is store as Triples (Subject - Predicate - Object).
    // Here we try to find the subject name that correspond to our application
    // There may be multiple apps already registered in the public type index
    // We need to check if our app is already registered or not.
    const appSubjects = publicTypeIndex.findSubjects(rdf.type, solid.TypeRegistration);
    for (const subject of appSubjects) {
        if (subject.asRef() === appRef) {
            return subject;
        }
    }
    return null;
}

async function createAppFolder(appFolderPath: string): Promise<TripleDocument> {
    const split = appFolderPath.lastIndexOf('/');
    const parentFolderPath = appFolderPath.substr(0, split);
    const applicationFolderName = appFolderPath.substr(split + 1);
    // The creation of a folder can be done using a POST request on the Solid Pod
    // It's hacky but tripledoc doesn't allow the creation of simple directory
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

async function registerAppStorage(publicTypeIndex: TripleDocument, appName: string, path: string) {
    const appRegistration = publicTypeIndex.addSubject({'identifier': appName});
    appRegistration.addRef(rdf.type, solid.TypeRegistration);
    appRegistration.addRef(solid.forClass, solid.instance);
    appRegistration.addRef(solid.instance, path);
    await publicTypeIndex.save([appRegistration]);
}

export function createExpense(doc: TripleDocument, person: TripleSubject, buyActionData: Expense) {
    const buyAction = doc.addSubject();
    // Add triple Person agent <ref BuyAction>
    person.addRef(schema.agent, buyAction.asRef());
    // Set the type to BuyAction
    buyAction.addRef(rdf.type, schema.BuyAction);
    // Add all the triples needed to define the BuyAction
    buyAction.addString(schema.identifier, buyActionData.identifier);
    buyAction.addString(schema.description, buyActionData.description);
    buyAction.addInteger(schema.price, buyActionData.price);
    buyAction.addString(schema.priceCurrency, buyActionData.priceCurrency);
    // Don't forget that it is not save yet, doc.save([buyAction]) must be called for that
    return buyAction; 
}

interface Expense {
    identifier: string;
    description: string;
    price: number;
    priceCurrency: string;
}

interface CandidateInfo {
    expenses: Expense[];
    donations: Expense[];
    totalExpenses: number;
    totalDonations: number;
}

/**
 * Get the candidate info from a WebID
 *
 * @param webID - WebID of the user that links to a Solid Pod
 *                    
 * @returns candidateInfo - Candidate information in the G103 form
 *
 * @example
 * 
 * const candidateInfo = await getCandidateInfo(webId, 'solidelections', 'g103.ttl'));
 */
export async function getCandidateInfo(webID: string, appName: string, formName: string): Promise<CandidateInfo> {
    const appStorage = await initAppStorage(webID, appName, false)
    const documents = listDocuments(appStorage);
    const fileRef = getFileRef(documents, formName)
    if(!fileRef) {
        return {expenses: [], donations: [], totalExpenses: 0, totalDonations: 0};
    }
    const form = await fetchDocument(fileRef);
    const expenses = getExpenses(form, schema.BuyAction);
    const totalExpenses = getSumPrice(expenses);
    const donations = getExpenses(form, schema.DonateAction);
    const totalDonations = getSumPrice(donations);
    return {
        expenses,
        donations,
        totalExpenses,
        totalDonations,
    }
}

function getFileName(docRef: string): string {
    const split = docRef.lastIndexOf('/');
    return docRef.substr(split + 1);
}

function getFileRef(documents: string[], filename: string): string | undefined {
    for(const doc of documents) {
        if(getFileName(doc) === filename) {
            return doc;
        }
    }
}

function getExpenses(form: TripleDocument, type: string): Expense[] {
    const buyActions = form.getAllSubjectsOfType(type);
    return buyActions.map(buyAction => {
        return {
            identifier: buyAction.getString(schema.identifier) || "",
            description: buyAction.getString(schema.description) || "",
            price: buyAction.getInteger(schema.price) || 0,
            priceCurrency: buyAction.getString(schema.priceCurrency) || "",
        };
    });
}

function getSumPrice(expenses: Expense[]): number {
    return expenses
        .map(expense => expense.price)
        .reduce((acc, x) => acc + x);
}
