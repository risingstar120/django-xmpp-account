# -*- coding: utf-8 -*-
# vim: expandtab:tabstop=4:hlsearch
#
# This file is part of django-xmpp-account (https://github.com/mathiasertl/django-xmpp-account/).
#
# django-xmpp-account is free software: you can redistribute it and/or modify it under the terms of
# the GNU General Public License as published by the Free Software Foundation, either version 3 of
# the License, or (at your option) any later version.
#
# django-xmpp-account is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
# without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See
# the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with django-xmpp-account.
# If not, see <http://www.gnu.org/licenses/>.

from __future__ import unicode_literals, absolute_import

import re

from django import forms
from django.conf import settings
from django.utils.translation import ugettext_lazy as _


class BootstrapMixin(object):
    """Mixin that adds the form-control class used by bootstrap to input widgets."""

    def __init__(self, **kwargs):
        super(BootstrapMixin, self).__init__(**kwargs)
        if self.widget.attrs.get('class'):
            self.widget.attrs['class'] += ' form-control'
        else:
            self.widget.attrs['class'] = 'form-control'


class XMPPAccountEmailField(BootstrapMixin, forms.EmailField):
    def __init__(self, **kwargs):
        kwargs.setdefault('label', _('email'))
        kwargs.setdefault(
            'help_text', _('Required, a confirmation email will be sent to this address.'))
        kwargs.setdefault('error_messages', {})
        kwargs['error_messages'].setdefault(
            'own-domain',
            _("This Jabber host does not provide email addresses. You're supposed to give your "
              "own email address."))
        kwargs['error_messages'].setdefault(
            'blocked-domain',
            _("Email addresses with this domain are blocked and cannot be used on this site."))

        super(XMPPAccountEmailField, self).__init__(**kwargs)

    def clean(self, value):
        email = super(XMPPAccountEmailField, self).clean(value)
        hostname = email.rsplit('@', 1)[1]

        if hostname in getattr(settings, 'NO_EMAIL_HOSTS', []):
            raise forms.ValidationError(self.error_messages['own-domain'])
        if hostname in getattr(settings, 'BLOCKED_EMAIL_TLDS', []):
                raise forms.ValidationError(self.error_messages['blocked-domain'])
        return email


class XMPPAccountFingerprintField(BootstrapMixin, forms.CharField):
    def __init__(self, **kwargs):
        # "gpg --list-keys --fingerprint" outputs fingerprint with spaces, making it 50 chars long
        kwargs.setdefault('label', _('GPG key (advanced, optional)'))
        kwargs.setdefault('max_length', 50)
        kwargs.setdefault('min_length', 50)
        kwargs.setdefault('required', False)
        kwargs.setdefault('help_text', _(
            'Add your fingerprint ("gpg --list-secret-keys --fingerprint") if your key is '
            'available on the public key servers.'))

        # define error messages
        kwargs.setdefault('error_messages', {})
        kwargs['error_messages'].setdefault('not-enabled', _('GPG not enabled.'))
        kwargs['error_messages'].setdefault('invalid-length',
                                            _('Fingerprint should be 40 characters long.'))
        kwargs['error_messages'].setdefault('invalid-chars',
                                            _('Fingerprint contains invalid characters.'))
        kwargs['error_messages'].setdefault('multiple-keys',
                                            _('Multiple keys with that fingerprint found.'))
        kwargs['error_messages'].setdefault('key-not-found',
                                            _('No key with that fingerprint found.'))
        super(XMPPAccountFingerprintField, self).__init__(**kwargs)

    def clean(self, value):
        if not settings.GPG:  # check, just to be sure
            raise forms.ValidationError(self.error_messages['not-enabled'])

        fp = super(XMPPAccountFingerprintField, self).clean(value).strip().replace(' ', '').upper()
        if fp == '':
            return None  # no fingerprint given
        if len(fp) != 40:
            raise forms.ValidationError(self.error_messages['invalid-length'])
        if re.search('[^A-F0-9]', fp) is not None:
            raise forms.ValidationError(self.error_messages['invalid-chars'])

        # actually search for the key
        keys = settings.GPG.search_keys(fp, settings.GPG_KEYSERVER)
        if len(keys) > 1:
            raise forms.ValidationError(self.error_messages['multple-keys'])
        elif len(keys) < 1:
            raise forms.ValidationError(self.error_messages['key-not-found'])

        return fp
