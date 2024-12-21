export type UploadResponse = {
  name: string;
  cid: string;
  size: number;
};

export async function uploadFile(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  fd.append("file", file);

  const result = await fetch(
    "https://ipfs-uploader.zora.co/api/v0/add?cid-version=1",
    {
      method: "POST",
      body: fd,
      credentials: "include",
    }
  );

  if (!result.ok) {
    throw new Error("Failed to upload file");
  }

  return await result.json();
}

export async function uploadJSON(
  json: any,
  filename: string = "metadata.json"
) {
  const metadataBlob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  const metadataFile = new File([metadataBlob], filename);

  return uploadFile(metadataFile);
}



export function getMediaDetails(media?: File, media_uri?: string) {
  if (!media || !media_uri) {
    return {};
  }
  return {
    content: {
      mime: media.type,
      size: media.size,
      uri: media_uri,
    },
  };
}

export function toIPFSUri(response: UploadResponse) {
  return `ipfs://${response.cid}`;
}