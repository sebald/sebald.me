/** What the check needs of a changeset: the packages it releases */
export interface ChangesetReleases {
  releases: readonly { name: string }[];
}

/**
 * The changed packages a pull request's changesets leave out. Without a
 * changeset every changed package is missing; when every changeset is
 * empty (`changeset --empty`) the pull request says nothing is released,
 * and none is; otherwise each changed package needs a changeset that
 * names it.
 */
export const missingPackages = (
  changed: readonly string[],
  changesets: readonly ChangesetReleases[],
): string[] => {
  if (changesets.length === 0) return [...changed];
  const named = new Set(
    changesets.flatMap(changeset => changeset.releases.map(r => r.name)),
  );
  if (named.size === 0) return [];
  return changed.filter(name => !named.has(name));
};
