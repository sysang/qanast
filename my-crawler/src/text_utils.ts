// @ts-nocheck
import XXHash from 'xxhash';

export const removeBreaklineCharacters = (text: string): string => {
  let splits = text.split('\n');
  let merged = splits.filter( s => !!s );

  return merged.join(' ');
}

export const hashText = (text: string): string => {
  return XXHash.hash64(Buffer.from(text, 'utf8'), 0xCAFEBABE, 'hex');
}
