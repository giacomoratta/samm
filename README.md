## What is

SAMM (Samples Archive Matching Module) is a command line based software which helps and preserve your creativity flow. Dive into your wide samples library, make researches, extract random samples and save them into the current project directory.

> In a couple of minutes... ask for samples, import in your project directory, use them!

---

## Principles

1. **Save your creativity flow.**  
   SAMM avoids you wasting your time dealing with hundreds of samples inside many nested directories. Just ask.

2. **Improve your creativity with randomness.**  
   SAMM does not care about how you organize your samples. It selects samples randomly based on simple human-readable queries.  
   (It will be funny to find some *old-but-good* samples or weird samples which you would have never chosen).

3. **Easy, fast and light interface to avoid CPU and RAM wastefulness.**  
   Don't be afraid about the command line and let's save CPU and RAM for the DAW.

---

## Download and install

1. Download the zip package and extract it.
2. Copy the directory `samm.0.1.0.win-x64` in your software or documents directory.
3. Add the absolute path of this directory to your PATH environment variable (see [Appendix A](#appendix-a---how-to-add-a-path-to-path-environment-variable)).
4. Close your terminal and open again: you should be able to run the command `samm`.

---

## Get started

Simple steps you need to start using SAMM in a few minutes; to do more see [all commands reference](#commands-reference).  
After the [preliminary steps](#download-and-install), you should be able to run the command `samm`.

### 1. Essential config

The only thing you need is to set the samples directory:  
`config SamplesDirectory "/home/user123/my samples dir/"` (quotes included)

Curious about all the configuration parameters? The command `config` shows all parameters, their descriptions and the current value.  
Hint: if you start typing `config Sampl`, press TAB and you will get the auto-completion.

### 2. First sample scan

In order to be able to run a search, all your samples need to be indexed; this process avoids wasting PC resources and slow searches.  
Run `samples-scan` and wait a few seconds.  
If you need to re-index, run `samples-scan -f` (`-f` means "force").

### 3. Set current project

Where will the samples be imported? Inside your project directory!  
Get the full path of your current project and run:  
`project "/home/user123/music-projects/project1"` (quotes included)

### 4. Look and export

Finally, everything is ready to search and import samples!  
I guess all of us have some kicks, right? So, run `look kick`.  
The result should be a short and random list of "kick" samples. If you run again, you will get a different list!  
To import these samples into your project, run `look-export` or `look-export kick-set1` (for a custom directory name), and answer “y”.  
Now, go back to your project, focus on this small subset of samples, and try to use them!

### 5. Set and use queries for look

For more complex results, you need to write a query.  
This application just uses human-readable queries: comma (`,`) is OR and plus (`+`) is AND.

Examples:

- `look kick,kick+dark,kc+raw` → all samples whose path contains 'kick', OR 'kick' and 'dark', OR 'kc' AND 'raw'.
- `look bass+moog,bass+303` → all samples whose path contains 'bass' AND 'moog', OR 'bass' AND '303'.

See [Appendix B - How queries works](#appendix-b---how-queries-works) for more details.

### 6. Switch the project

- To switch to another project in the same directory: `project-list`
- To switch to a previous project: `project-history`

### 7. Tune the sample scan

Do you want more random samples?  
Do you want to exclude some extensions or include only specific ones?  
Do you want to exclude some directories?  
Check the command `config` inside the Reference section.

---

## Commands reference

### `config [options] [name] [values...]`
Get or set the value of a configuration parameter.

| Name | Description | Example |
|------|--------------|----------|
| **SamplesDirectory** | Directory with samples to scan and search in (absolute path). | `config SamplesDirectory "C:\all samples\"` |
| **LookRandomCount** | Maximum number of random samples selected after a search. | `config LookRandomCount 15` |
| **LookRandomSameDirectory** | Maximum number of samples from the same directory, to avoid too many from the same family. | `config LookRandomSameDirectory 2` |
| **SamplesDirectoryExclusions** | Directories to skip during the scan process (relative to `SamplesDirectory`). | `config SamplesDirectoryExclusions /manuals /samplesABC/legacy`<br>`config SamplesDirectoryExclusions -r /manuals` |
| **ExcludedExtensionsForSamples** | File extensions to skip during sample scan. | `config ExcludedExtensionsForSamples exe txt`<br>`config ExcludedExtensionsForSamples -r exe` |
| **IncludedExtensionsForSamples** | File extensions to include in the sample scan. | `config IncludedExtensionsForSamples wav mp3`<br>`config IncludedExtensionsForSamples -r wav` |
| **ExtensionsPolicyForSamples** | Policy for sample scan: `'I'` include only declared extensions, `'E'` exclude some, `'X'` disable filter. | `config ExtensionsPolicyForSamples I` |
| **TemplatesDirectory** | Directory where templates are located. | `config TemplatesDirectory "C:\my templates\"` |

---

### `bookm [options] [label]`
Show or manage bookmarks.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-c, --copy <new-label>` | Copy bookmarks to a new or existing label |
| `-i, --info` | Show more info |
| `-l, --label <new-label>` | Change the label of a bookmark set |
| `-r, --remove [indexes]` | Remove a label or bookmarks by index (e.g. `3,5,7`) |

---

### `bookm-export [options] [label]`
Export bookmarks to current project or custom path.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-p, --path` | Custom destination path |

---

### `bookm-look`
Add bookmarks from latest lookup.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |

---

### `look [options] [query]`
Search samples by query or show the latest lookup.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-i, --info` | Show more info |
| `-l, --label <label>` | Use a query label (see `query` command) |

---

### `look-export [options] [dirname]`
Export latest samples look in the current project.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-o, --overwrite` | Overwrite destination directory if exists |
| `-p, --path <custom-path>` | Save lookup to current or custom path |

---

### `project [path]`
Show info about or set the current project.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |

---

### `project-history [options]`
Show all project history or set current project.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-d, --date` | Order by date |
| `-n, --name` | Order by name |

---

### `project-list [options]`
Show all projects in the same parent directory or set one as current.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-d, --date` | Order by date |

---

### `project-template`
Show all templates or create a new project from one.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |

---

### `query [options] [label] [query]`
Manage queries for samples and matching directories/files.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-c, --copy <label>` | Duplicate a query |
| `-l, --label <label>` | Change the query label |
| `-r, --remove` | Remove a query |

---

### `samples-scan [options]`
Perform a full scan of the samples directory and create the index.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-f, --force` | Force the rescan |

---

### `search [options] [query]`
Search samples by query or show the latest search results.

| Option | Description |
|---------|-------------|
| `--help` | Output usage information |
| `-l, --label <label>` | Use a query label (see `query` command) |

---

## Appendix A - How to add a path to PATH environment variable

The following steps will let you run `samm` directly from your terminal.

### Windows

1. Copy the directory `samm.0.1.0.win-x64` in your software or documents directory.
2. Get its absolute path (e.g. `C://Programs//samm.0.1.0.win-x64`).
3. Go to **System Properties → Advanced → Environment Variables**.
4. Under **System Variables**, edit the `Path` variable.
5. Add a new entry with your path. If it contains spaces, wrap it in quotes.
6. Close your terminal and open it again. You should be able to run `samm`.

### Mac

1. Copy `samm.0.1.0.mac-x64` to your software directory.
2. Get its path (e.g. `/home/user123/software/samm.0.1.0.mac-x64`).
3. Edit `/etc/paths` with `sudo nano /etc/paths`.
4. Add the path at the end of the file.
5. Save and restart your terminal.

### Linux

1. Copy `samm.0.1.0.linux-x64` to your software directory.
2. Get its path (e.g. `/home/user123/software/samm.0.1.0.linux-x64`).
3. Edit your `~/.bashrc`: `nano ~/.bashrc`.
4. Add `PATH=$PATH:/home/user123/software/samm.0.1.0.linux-x64`.
5. Save and reopen your terminal.

---

## Appendix B - How queries works

Queries are simple combinations of AND (`+`) and OR (`,`) conditions.

A query matches a sample if the sample file or its full path contains the words stated in the query (respecting AND/OR logic).  
This lets you **keep your sample-packs as they are**!

**Examples:**
- `kick+raw` → “kick” AND “raw”
- `guitar,string` → “guitar” OR “string”
- `kick+raw,deep+tom` → “kick+raw” OR “deep+tom”
