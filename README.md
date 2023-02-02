Additional discussion in [`src/index.js`].

Graph PNGs were generated from a local Parcel build with the `AssertionError`
caught so that parcel would continue and write graphs.

## Bug 1: Difficult DX

The `AssertionError` is cryptic (refers to Parcel internals) and does not
provide any insight.

From the BundleGraph PNG, we can see Parcel knows the problematic `foo.css`
asset is both a "stand-alone" top-level dependency and a dependency below the
lazy `Foo` import.

In this case, it's probably not clear what to do with `foo.css` -- it is needed
at the top level, so it must be emitted there; but it's also needed by the
module, so it must be emitted there as well.  Perhaps two CSS files, one in each
modules, should `@import` the `foo.css` content?  I am not very familiar with
approaches to automatic bundling and CSS imports.

Regardless, if Parcel cannot determine what to do, it could output the asset
name and, if dynamic imports can cause a problem, the name of the dynamic
module.

Presumably a dynamic import is not the only way a name collision can occur when
bundling, but perhaps this case is one parcel can inspect.

Error with or without caching, regardless of multiple runs:

```
for i in 1 2 3 ; do
  [[ -d dist ]] && rm -rf dist ; npx parcel build --no-cache src/index.js
  # Or
  # [[ -d dist ]] && rm -rf dist ; npx parcel build src/index.js
done
```

## Bug 2: Mis-use of cache / failed cache invalidation

If Parcel has successfully bundled and generated a cache, it will successfully
bundle on subsequent runs, even if the current state of the code would not
bundle **without** a cache.  It seems parcel is failing to invalidate the cache.

This means it is possible to ship code that will not build during deployment or
for teammates, as those builds will not have the local cache help Parcel.

(This will occur with `parcel serve` as well.)

0. `[[ -d .parcel-cache ]] && rm -rf .parcel-cache`
1. Run parcel with caching, it will fail: `parcel build src/index.js`
2. Comment out line 9 `import 'Foo/foo.css';`.
3. Run parcel with caching again, it will succeed.
4. Uncomment line 9, i.e., revert to step 1, but now parcel has the cache from a successful run.
5. Run parcel with caching... it should fail, but does not.
