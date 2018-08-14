/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TPromise } from 'vs/base/common/winjs.base';
import * as uuid from 'vs/base/common/uuid';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { resolveCommonProperties } from '../node/commonProperties';

// {{ SQL CARBON EDIT }}
import product from 'vs/platform/node/product';
import * as Utils from 'sql/common/telemetryUtilities';

export function resolveWorkbenchCommonProperties(storageService: IStorageService, commit: string, version: string, machineId: string, installSourcePath: string): TPromise<{ [name: string]: string }> {
	return resolveCommonProperties(commit, version, machineId, installSourcePath).then(result => {
		// __GDPR__COMMON__ "common.version.shell" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
		result['common.version.shell'] = process.versions && (<any>process).versions['electron'];
		// __GDPR__COMMON__ "common.version.renderer" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
		result['common.version.renderer'] = process.versions && (<any>process).versions['chrome'];
		// {{SQL CARBON EDIT}}
		result['common.application.name'] = product.nameLong;
		// {{SQL CARBON EDIT}}
		result['common.userId'] = '';

		// {{SQL CARBON EDIT}}
		// const lastSessionDate = storageService.get('telemetry.lastSessionDate');
		// const firstSessionDate = storageService.get('telemetry.firstSessionDate') || new Date().toUTCString();
		// storageService.store('telemetry.firstSessionDate', firstSessionDate);
		// storageService.store('telemetry.lastSessionDate', new Date().toUTCString());

		// // __GDPR__COMMON__ "common.firstSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
		// result['common.firstSessionDate'] = firstSessionDate;
		// // __GDPR__COMMON__ "common.lastSessionDate" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
		// result['common.lastSessionDate'] = lastSessionDate;
		// // __GDPR__COMMON__ "common.isNewSession" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
		// result['common.isNewSession'] = !lastSessionDate ? '1' : '0';

		// {{SQL CARBON EDIT}}
		// __GDPR__COMMON__ "common.instanceId" : { "classification": "EndUserPseudonymizedInformation", "purpose": "FeatureInsight" }
		// result['common.instanceId'] = getOrCreateInstanceId(storageService);
		result['common.instanceId'] = '';

		// {{SQL CARBON EDIT}}
		setUsageDates(storageService, result);
		return result;
	});
}

// {{SQL CARBON EDIT}}
// function getOrCreateInstanceId(storageService: IStorageService): string {
// 	const result = storageService.get('telemetry.instanceId') || uuid.generateUuid();
// 	storageService.store('telemetry.instanceId', result);
// 	return result;
// }

// {{SQL CARBON EDIT}}
function setUsageDates(storageService: IStorageService, result: {[key:string]: string}): void {
	// first usage date
	const firstUseDate = storageService.get('telemetry.firstUseDate') || convertToDate(new Date());
	storageService.store('telemetry.firstUseDate', firstUseDate);

	// last usage date
	const lastUseDate = storageService.get('telemetry.lastUseDate') || convertToDate(new Date());
	storageService.store('telemetry.lastUseDate', lastUseDate);
}

export function convertToDate(date: Date): string {
	let day = date.getDate();
	let month = date.getMonth();
	let year = date.getFullYear();
	return `${month}/${day}/${year}`;
}

export function diffInDays(nowDate: string, lastUseDate: string): number {
	let nowDateArray = nowDate.split('/');
	let lastUseDateArray = lastUseDate.split('/');
	let newNowDate: any = new Date(+nowDateArray[2], +nowDateArray[1], +nowDateArray[0]);
	let newLastUseDate: any = new Date(+lastUseDateArray[2], +lastUseDateArray[1], +lastUseDateArray[0]);
	return (newNowDate - newLastUseDate)/(24*3600*1000);
}