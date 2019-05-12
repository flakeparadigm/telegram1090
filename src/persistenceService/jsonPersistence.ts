import * as fs from 'fs';
import * as path from 'path';
import { PersistenceImplementation } from './persistenceImplementation';
import { AppConfig } from '../loadConfig';

export class JsonPersistence<T> implements PersistenceImplementation<T> {
    private readonly path: string;
    private readonly defaultValue: T;

    public constructor(name: string, defaultValue: T, config: AppConfig) {
        this.path = path.join(__dirname, '../../', config.persistence_base_dir, '/', `${name}.json`);
        this.defaultValue = defaultValue;
    }

    public save(data: T): void {
        fs.writeFileSync(this.path, JSON.stringify(data));
    }

    public load(): T {
        if (fs.existsSync(this.path)) {
            try {
                const fileData = fs.readFileSync(this.path, 'utf-8');

                return fileData ? JSON.parse(fileData) : this.defaultValue;
            } catch (e) {
                e.message = `Error loading persistence file: ${this.path}\n${e.message}`;
                throw e;
            }
        } else {
            this.save(this.defaultValue);
            return this.defaultValue;
        }
    }

    public getSize(): number {
        const file = fs.openSync(this.path, 'r');
        const size = fs.fstatSync(file).size;

        fs.closeSync(file);
        return size;
    }
}
