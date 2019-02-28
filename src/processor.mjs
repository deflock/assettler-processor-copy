import nodepath from 'path';
import GenericProcessor from '@assettler/core/lib/generic-processor';

/**
 *
 */
export default class Processor extends GenericProcessor {
    /**
     * @param {string} destDir
     * @param {Object} options
     */
    constructor(destDir, options = {}) {
        super(Object.assign({
            extensions: [],
        }, options));

        this.destDir = destDir;

        this.map = {};
    }

    /**
     * @param {Object|Array} files
     * @param {Object} params
     * @returns {Promise<any[]>}
     */
    async process(files, params) {
        return super.process(files, params)
            .then(() => {
                const hashedMap = {};

                for (const asset of Object.keys(this.map)) {
                    hashedMap[this.map[asset]] = this.map[asset];
                }

                return Promise.all([
                    this.writeAsJson(this.getOption('mapPaths.resourcesToAssetsJson'), this.map),
                    this.writeAsJson(this.getOption('mapPaths.hashedAssetsJson'), hashedMap),
                ]);
            });
    }

    /**
     * @param {Object} file
     * @param {Object} params
     * @returns {Promise<void>}
     */
    async onInit(file, params) {
        return this.doTrack(file, params);
    }

    /**
     * @param {Object} file
     * @param {Object} params
     * @returns {Promise<void>}
     */
    async onAdd(file, params) {
        return this.doTrack(file, params);
    }

    /**
     * @param {Object} file
     * @param {Object} params
     * @returns {Promise<void>}
     */
    async onChange(file, params) {
        return this.doTrack(file, params);
    }

    /**
     * @param {Object} file
     * @param {Object} params
     * @returns {Promise<void>}
     */
    async doTrack(file, params) {
        const relativePath = file.path;
        const basedir = params.basedir || params.cwd;

        const srcPath = nodepath.resolve(basedir, relativePath);
        const destPath = await this.copyFile(srcPath, this.destDir, '[contentHash:12].[ext]');

        this.map[relativePath] = nodepath.relative(this.destDir, destPath);
    }
}
