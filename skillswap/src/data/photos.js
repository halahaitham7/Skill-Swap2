// Photography used on marketing pages. All images are free to use under the
// Unsplash License (https://unsplash.com/license) and served by the Unsplash CDN.
// Credits are shown next to each photo and listed in the README.

export const PHOTOS = {
  hero: {
    id: 'photo-1741237039737-7381d9201a65',
    width: 1200,
    height: 800,
    alt: 'A group of friends gathered around a camera, looking at the photos on its screen',
    credit: 'Justin Min',
    page: 'https://unsplash.com/photos/friends-gather-around-a-camera-looking-at-photos-U_v2LK2V6aM',
  },
  community: {
    id: 'photo-1683624328172-88fb24625ec1',
    width: 1200,
    height: 800,
    alt: 'Four people cooking together in a home kitchen, laughing as they prepare vegetables',
    credit: 'Sweet Life',
    page: 'https://unsplash.com/photos/a-group-of-people-preparing-food-in-a-kitchen-ANY9TweFHNI',
  },
  about: {
    id: 'photo-1794209166400-c3e2fed02d73',
    width: 1200,
    height: 675,
    alt: 'An instructor showing a woman, a man and a child how to shape clay on pottery wheels',
    credit: 'Vitaly Gariev',
    page: 'https://unsplash.com/photos/pottery-class-with-instructor-and-students-kzI4aXD1a2Y',
  },
};

/** Builds a sized, cropped Unsplash CDN URL. */
export function photoUrl(id, width) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}
