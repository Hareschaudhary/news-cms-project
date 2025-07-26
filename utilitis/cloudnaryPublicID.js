   const getCloudinaryPublicId = (url) => {
    console.log(url)
  const urlParts = url.split('/upload/'); 
  if (urlParts.length !== 2) return null;

  const pathWithVersion = urlParts[1]; 
  const withoutVersion = pathWithVersion.replace(/^v\d+\//, ''); 

  const publicId = withoutVersion.replace(/\.[^/.]+$/, ''); 
  return publicId; 
};

export default getCloudinaryPublicId