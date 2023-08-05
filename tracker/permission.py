from rest_framework import permissions


# EFFECT: Prevents for accessing family uiud enpoint for other families
class ViewMembersInOwnFamilyOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        member = request.user.member
        family_id = member.family.id
        provided_family_id = view.get_permission_context().get('family_id')

        print(view.get_permission_context().get('family_id'))
        print(family_id)

        return str(family_id).replace('-', '') == provided_family_id


# EFFECT: Prevents for accessing endpoints for other families
class ViewItemInOwnFamilyOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        member = request.user.member
        family_id = member.family.id

        print(family_id)
        print(view.kwargs['family_pk'])

        return str(family_id).replace('-', '') == view.kwargs['family_pk']
