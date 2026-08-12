# Supplier photographs

Photographs for the **sample** listings go here. Real suppliers upload their own
through the dashboard — those go to Firebase Storage, not this folder.

## Adding one

1. Save the file here as `<listing-slug>-1.jpg`, e.g. `acacia-hill-estate-1.jpg`.
   The slug is the last part of the listing's URL.
2. List it in `src/data/photos.ts`:

   ```ts
   export const SUPPLIER_PHOTOS: Record<string, string[]> = {
     'acacia-hill-estate': [
       '/img/suppliers/acacia-hill-estate-1.jpg',
       '/img/suppliers/acacia-hill-estate-2.jpg',
     ],
   }
   ```

The first entry is the cover image shown on cards. Anything you leave out falls
back to the category line drawing, so a partial list is fine.

## Guidelines

- **Portrait, roughly 1200 × 1500.** Cards crop to 4:5; the profile hero crops
  to 3:2.
- **Under ~300 KB each.** These ship in the build, so large files slow the
  first load for everyone. `cwebp -q 78` or any image compressor is plenty.
- **Only use pictures you have the right to publish.** Supplier-supplied or
  properly licensed stock. This is the most common reason a listing gets
  rejected, so we should hold ourselves to it too.
