from rest_framework import permissions


# EFFECT: Prevents family-unregistered user for accessing endpoints for other families
class LinkMemberPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.member.family != None


# EFFECT: Prevents for accessing endpoints for other families
class ViewItemInOwnFamilyOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        member = request.user.member

        family_id = member.family_id

        return str(family_id) == view.kwargs['family_pk']
