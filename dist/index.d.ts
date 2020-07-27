import { TripleDocument, LocalTripleDocumentForContainer } from 'tripledoc';
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
export declare function initAppStorage(webID: string, appName: string, initEmpty?: boolean): Promise<TripleDocument>;
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
export declare function createAppDocument(appStorage: TripleDocument, docName: string): LocalTripleDocumentForContainer;
/**
 * List all documents inside an appStorage
 *
 * @param appStorage - Application storage created with the function `initAppStorage`
 *
 * @returns string[] - references to documents stored into the app storage
 *
 */
export declare function listDocuments(appStorage: TripleDocument): string[];
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
export declare function getCandidateInfo(webID: string, appName: string, formName: string): Promise<CandidateInfo>;
export {};
