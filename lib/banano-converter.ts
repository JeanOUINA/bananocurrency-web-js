import BigNumber from 'bignumber.js'

export default class BananoConverter {

	/**
	 * Converts the input value to the wanted unit
	 *
	 * @param input {string | BigNumber} value
	 * @param inputUnit {string} the unit to convert from
	 * @param outputUnit {string} the unit to convert to
	 */
	static convert(input: string | BigNumber, inputUnit: string, outputUnit: string): string {
		let value = new BigNumber(input.toString())

		switch (inputUnit) {
			case 'RAW':
				value = value
				break
			case 'BAN':
				value = value.shiftedBy(29)
				break
			case 'BANOSHI':
				value = value.shiftedBy(27)
				break
			default:
				throw new Error(`Unkown input unit ${inputUnit}, expected one of the following: RAW, BAN, BANOSHI`)
		}

		switch (outputUnit) {
			case 'RAW':
				return value.toFixed(0)
			case 'BAN':
				return value.shiftedBy(-29).toFixed(29, 1)
			case 'BANOSHI':
				return value.shiftedBy(-27).toFixed(27, 1)
			default:
				throw new Error(`Unknown output unit ${outputUnit}, expected one of the following: RAW, BAN, BANOSHI`)
		}
	}

}
