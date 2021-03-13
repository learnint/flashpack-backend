import { Injectable } from "@nestjs/common";

@Injectable()
export class StringUtil {
     makeName(name: string) {
        let words = name.toLowerCase().trim().split(' ');
        words = words.filter(x => x !== '');
        words = words.map(
            x => x.split('')[0].toUpperCase() + x.slice(1,x.length).trim()
        );
        return words.join(' ');
    }
}