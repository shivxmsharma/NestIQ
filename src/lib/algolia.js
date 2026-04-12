import algoliasearch from "algoliasearch";

const getAdminClient = () =>
  algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
  );

export const getPropertiesIndex = () =>
  getAdminClient().initIndex('nestiq_properties');

export const syncPropertiesToAlgolia = async (property) => {
  try {
    const index = getPropertiesIndex();
    const locality = property.address?.locality || '';
    const city = property.address?.city || '';
    const beds = property.details?.bedrooms;

    const record = {
      objectID: property._id.toString(),
      title:
        property.title ||
        `${beds ? beds + ' BHK ' : ''}${property.propertyType} in ${locality}, ${city}`,
      listingType: property.listingType,
      propertyType: property.propertyType,
      price: property.price || 0,
      city,
      locality,
      state: property.address?.state || '',
      street: property.address?.street || '',
      bedrooms: property.details?.bedrooms || 0,
      bathrooms: property.details?.bathrooms || 0,
      area: property.details?.area || 0,
      furnishing: property.details?.furnishing || '',
      constructionStatus: property.details?.constructionStatus || '',
      isReraVerified: property.isReraVerified || false,
      trustScore: property.trustScore || 70,
      coverPhoto: property.photos?.[0]?.url || '',
      amenities: property.amenities || [],
      status: property.status || 'active',
      createdAt: property.createdAt
        ? new Date(property.createdAt).getTime()
        : Date.now(),
    };

    if (property.location?.coordinates?.length === 2) {
      record._geoloc = {
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
      };
    }

    await index.saveObject(record);
  } catch (err) {
    console.error('[Algolia] Sync error:', err.message);
  }
};

export const deletePropertyFromAlgolia = async (id) => {
  try {
    const index = getPropertiesIndex();
    await index.deleteObject(id.toString());
  } catch (err) {
    console.error('[Algolia] Delete error:', err.message);
  }
};