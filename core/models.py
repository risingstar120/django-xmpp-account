# -*- coding: utf-8 -*-
#
# This file is part of xmppregister (https://account.jabber.at/doc).
#
# xmppregister is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# xmppregister is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with xmppregister.  If not, see <http://www.gnu.org/licenses/>.

from __future__ import unicode_literals

from django.conf import settings
from django.db import models

from django.contrib.auth.models import AbstractBaseUser


class Registration(AbstractBaseUser):
    username = models.CharField(max_length=1023, unique=True)
    host = models.CharField(
        max_length=64,
        choices=tuple([(host, host) for host in settings.XMPP_HOSTS])
    )
    email = models.EmailField(unique=True)

    # when the account was first registered
    registered = models.DateTimeField(auto_now_add=True)
    # when the email was confirmed
    confirmed = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'host', 'email', 'registered', ]
