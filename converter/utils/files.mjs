/**
 * Provides utilities for filesystem/IO operations
 */

import Path from 'path';
import { promises as FS} from 'fs';

import Chalk from 'chalk';
import RimRaf from 'rimraf';

import { CreateError, CreateWarning } from '../reporting.mjs';

export const RootFolder = Path.resolve(process.cwd(), '../');

export const SourceFolder = Path.resolve(RootFolder, 'converter', 'source');
export const SchemaFolder = Path.resolve(RootFolder, 'schema');
export const OutputFolder = Path.resolve(RootFolder, 'converter', 'output');

export const GetSourceFolder = dir => Path.join(SourceFolder, dir);
export const GetOutputFolder = dir => Path.join(OutputFolder, dir);

export async function EnsureDirectoryExists(dir, mask='0744') {
    try {
        await FS.mkdir(dir, {
            recursive: true,
            mode: mask,
        });
        console.log(`Created output directory "${dir}"`);
    } catch(err) {
        if(err.code !== 'EEXIST') { //Folder doesn't already exist, and theres an error
            //Hoist the error up
            CreateError(`Ensuring existance of directory "${dir}" failed with code "${err.code}": ${err.message}`);
            throw err;
        }
    }
}

export async function SourceDirectoryExists(dir) {
    const path = GetSourceFolder(dir);
    try {
        await FS.exists(path);
    } catch(err) {
        //Hoist the error up
        CreateError(`Checking if source directory "${path}" exists failed: ${err.message || err}`);
        throw err;
    }
}

export async function SourceFileExists(dir, file) {
    const path = Path.join(GetSourceFolder(dir), file);
    try {
        await FS.exists(path);
    } catch(err) {
        //Hoist the error up
        CreateError(`Checking if source file "${path}" exists failed: ${err.message || err}`);
        throw err;
    }
}

export function CleanOutputFolder(dir) {
    return new Promise((resolve, reject) => {
        const path = GetOutputFolder(dir);
        console.log(`Cleaning output folder "${path}".`);
        RimRaf(path, (err) => {
            if(err) return reject(err);
            resolve();
        });
    });
}