#!/bin/bash
set -e

composer install --no-interaction --prefer-dist
php artisan migrate --force
