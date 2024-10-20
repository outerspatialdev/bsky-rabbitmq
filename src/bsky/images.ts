export function getFeedFullsizeUrl(did: string, hash: string, mime: string) {
    let mimePart = mime;
    if (mime.startsWith("image/")) {
        mimePart = mime.slice(6);
    }

    const url = `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${hash}@${mimePart}`;
    return url;
}

export function getFeedThumbnailUrl(did: string, hash: string, mime: string) {
    let mimePart = mime;
    if (mime.startsWith("image/")) {
        mimePart = mime.slice(6);
    }

    const url = `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${hash}@${mimePart}`;
    return url;
}
