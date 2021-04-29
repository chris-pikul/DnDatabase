import Chalk from 'chalk';

var warnList = [];
var errorList = [];

export function AddError(err) {
    if(typeof err === 'string')
        errorList.push(new Error(msg));
    else 
        errorList.push(err);
}

export function CreateError(msg, add) {
    const err = new Error(msg);
    if(add)
        err.additional = add;
    AddError(err);

    console.log( Chalk.red(msg) );
    
    return err;
}

export function GetErrors() {
    return [ ...errorList ];
}

export function HasErrors() {
    return errorList.length > 0;
}

export function ClearErrors() {
    errorList.length = 0;
}

export function AddWarning(warn) {
    if(typeof warn === 'string') {
        warnList.push({
            message: warn,
        });
    } else
        warnList.push(warn);
}

export function CreateWarning(msg, add) {
    const warn = {
        message: msg.toString()
    };
    if(add)
        warn.additional = add;
    AddWarning(warn);

    console.log( Chalk.yellow(msg) );

    return warn;
}

export function GetWarnings() {
    return [ ...warnList ];
}

export function HasWarnings() {
    return warnList.length > 0;
}

export function ClearWarnings() {
    warnList.length = 0;
}

export function GetReports() {
    return [
        GetErrors(),
        GetWarnings(),
    ];
}

export function PrintExitReport() {
    const [ errs, warns ] = GetReports();

    if(errs.length > 0 || warns.length > 0) {
        warns.forEach(warn => {
            console.log( Chalk.yellowBright(warn.message || warn) );
            if(warn.additional) {
                if(Array.isArray(warn.additional))
                    warn.additional.forEach(add => console.log(Chalk.yellow(`\t${add}`)));
                else
                    console.log(Chalk.yellow(`\t${warn.additional}`));
            }
        });

        errs.forEach(err => {
            console.log( Chalk.redBright(err.message || err) );
            if(err.additional) {
                if(Array.isArray(err.additional))
                    err.additional.forEach(add => console.log(Chalk.red(`\t${add}`)));
                else
                    console.log(Chalk.red(`\t${err.additional}`));
            }
        });

        //Print final output
        let outfmt = Chalk.bgYellow.whiteBright;
        if(errs.length > 0) outfmt = Chalk.bgRed.whiteBright;
        console.log( outfmt(`Task completed with ${warns.length} warning(s) and ${errs.length} error(s)`) );
    } else {
        console.log( Chalk.bgGreen.whiteBright(`Task completed successfully, no errors or warnings.`));
    }
}

export function BindToProcess() {
    process
        .on('unhandledRejection', (reason, promise) => {
            console.error( Chalk.bgRed.whiteBright(`Unhandled promise rejection!`) );
            console.error( promise, reason );
        })
        .on('uncaughtException', (err) => {
            console.error( Chalk.bgRed.whiteBright(`Unhandled exception caught!`) );
            console.error( err );
            process.exit(1);
        })
        .on('exit', () => {
            PrintExitReport();
        });
}