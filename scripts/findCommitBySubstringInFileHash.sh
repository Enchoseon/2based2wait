#!/bin/sh
# Description: Prints all instances of a file with a git hash containing the given argument. Results are formatted as "commit (subject): hash (name)".
# Why: Using the short hashes outputted by `npm run debug-info`, this utility can be used to figure out what commit someone is using if they don't have a .git folder based on their last modified file (which is also outputted by `npm run debug-info`)
find="$1"
echo "Searching for file with git hash containing \"$find\":"
shift
git log "$@" --pretty=format:'%T %h %s' \
| while read tree commit subject ; do
    git ls-tree -r "$commit" | while read _ _ sha name; do \
        if [[ "$sha" == *"$find"* ]]; then
            echo "$commit ($subject): $sha ($name)"
        fi
    done
done
