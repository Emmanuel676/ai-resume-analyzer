/**
 * format a file size to bytes to a human-readable string(KB, MB, or GB.
 *
 * @param bytes- The size in bytes
 *@return A formated string with the seperate units.
 */
export function formatSize(bytes: number): string {
 if(bytes===0) return  '0 Bytes';

 const k = 1024;
 const sizes= ['Bytes','KB','MB','GB','TB'];

 const i = Math.floor(Math.log(bytes) / Math.log(k));

 return (bytes/Math.pow(k,i)).toFixed(2) + ' ' + sizes[i];

}

export default formatSize;
