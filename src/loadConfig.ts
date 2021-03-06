import * as fs from 'fs';

const configPath = './config.json';

export interface AppConfig {
    dump1090_host: string;
    dump1090_port: number;
    home_lat: number;
    home_lon: number;
    home_range: number;
    persistence_base_dir: string;
    persistence_save_interval: number;
    telegram_token: string;
}

export function loadConfig(): AppConfig {
    const configString: string = fs.readFileSync(configPath).toString();

    // add validation/defaults?

    return JSON.parse(configString);
}
