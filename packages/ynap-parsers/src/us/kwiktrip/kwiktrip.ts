import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../util/papaparse';

export interface KwikTripRow {
    'Account Number': string;
    'Adjustment Description': string;
    'Card Description One': string;
    'Card Description Two': string;
    'Card Number': string;
    'Card Type': string;
    'Cash Advance Amount': string;
    'Driver Number': string;
    'Fuel Amount': string;
    Gallons: string;
    'Instore Total': string;
    'Job Number': string;
    'Odometer Number': string;
    'Po Number': string;
    'Price Per Gallon': string;
    'Product Abbreviation': string;
    'Product Number': string;
    'Store City': string;
    'Store Name': string;
    'Store Number': string;
    'Store State': string;
    'Store Zip': string;
    'Transaction Date': string;
    'Transaction Number': string;
    'Transaction Time': string;
    'Transaction Total': string;
    'Transaction Update Date': string;
    Type: string;
    'Vehicle Number': string;
    'Voucher Number': string;
}

export const generateYnabDate = (input: string) => {
    const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);

    if (!match) {
        throw new Error('The input is not a valid date. Expected format: MM-DD-YYYY');
    }

    const [, month, day, year] = match;
    return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const KwikTripParser: ParserFunction = async (file: File) => {
    const { data } = await parse(file, { header: true });

    return [
        {
            data: (data as KwikTripRow[])
                .filter(r => r['Transaction Date'] && r['Transaction Total'])
                .map(r => ({
                    Date: generateYnabDate(r['Transaction Date']),
                    Payee: r['Store Name'],
                    Memo: '',
                    Outflow:
                        Number(r['Transaction Total']) > 0 ? Number(r['Transaction Total']) : undefined,
                    Inflow:
                        Number(r['Transaction Total']) < 0 ? Number(r['Transaction Total']) : undefined,
                })),
        },
    ];
};

export const KwikTripMatcher: MatcherFunction = async (file: File) => {
    const requiredKeys: (keyof KwikTripRow)[] = [
        'Transaction Date',
        'Transaction Total',
        'Store Name'
    ];

    const { data } = await parse(file, { header: true });

    if (data.length === 0) {
        return false;
    }

    const keys = Object.keys(data[0]);
    const missingKeys = requiredKeys.filter(k => !keys.includes(k));

    if (missingKeys.length === 0) {
        return true;
    }

    return false;
};

export const KwikTrip: ParserModule = {
    name: 'KwikTrip',
    country: 'us',
    fileExtension: 'csv',
    filenamePattern: /^transactions\.csv$/,
    link: 'https://kwikrewards.com',
    match: KwikTripMatcher,
    parse: KwikTripParser,
};
