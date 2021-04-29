import {
    ObjectMappings,
    GetOutputFolder,
    EnsureDirectoryExists,
    CleanOutputFolder,
} from '../utils/index.mjs';

const ObjectMap = ObjectMappings.abilityScore;

export default function AbilityScores() {
    return new Promise(async (resolve, reject) => {
        try {
            await EnsureDirectoryExists( GetOutputFolder(ObjectMap.outputFolder) );
            await CleanOutputFolder(ObjectMap.outputFolder);
        } catch(err) {
            //Assuming these have properly created the custom errors ahead of time
            reject(err);
            return;
        }

        // Should return an array of promises representing
        // each object to be processed
        resolve([]);
    });
}