import { Injectable } from '@nestjs/common';

@Injectable()
export class StringUtil {
  makeName(name: string) {
    let words = name.toLowerCase().trim().split(' ');
    words = words.filter((x) => x !== '');
    words = words.map(
      (x) => x.split('')[0].toUpperCase() + x.slice(1, x.length).trim(),
    );
    return words.join(' ');
  }

  async isUUID(uuid: string): Promise<boolean> {
    const match = uuid.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    return match ? true : false;
  }
}
