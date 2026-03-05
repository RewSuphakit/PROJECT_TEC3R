/**
 * Toggle a group ID in the openGroups state array.
 * If the groupId exists, it is removed; otherwise, it is added.
 *
 * @param {Function} setOpenGroups - State setter for the openGroups array
 * @param {string|number} groupId - The group ID to toggle
 */
export const toggleGroup = (setOpenGroups, groupId) => {
    setOpenGroups((prev) =>
        prev.includes(groupId)
            ? prev.filter((id) => id !== groupId)
            : [...prev, groupId]
    );
};
