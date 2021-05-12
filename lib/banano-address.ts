//@ts-ignore
import { blake2b } from 'blakejs'

import Convert from './util/convert'

export default class BananoAddress {

	readonly alphabet = '13456789abcdefghijkmnopqrstuwxyz'
	readonly prefix = 'ban_'

	deriveAddress = (publicKey: string): string => {
		const publicKeyBytes = Convert.hex2ab(publicKey)
		const checksum = blake2b(publicKeyBytes, undefined, 5).reverse()
		const encoded = this.encodeBananoBase32(publicKeyBytes)
		const encodedChecksum = this.encodeBananoBase32(checksum)

		return this.prefix + encoded + encodedChecksum
	}

	encodeBananoBase32 = (publicKey: Uint8Array): string => {
		const length = publicKey.length
		const leftover = (length * 8) % 5
		const offset = leftover === 0 ? 0 : 5 - leftover

		let value = 0
		let output = ''
		let bits = 0

		for (let i = 0; i < length; i++) {
			value = (value << 8) | publicKey[i]
			bits += 8

			while (bits >= 5) {
				output += this.alphabet[(value >>> (bits + offset - 5)) & 31]
				bits -= 5
			}
		}

		if (bits > 0) {
			output += this.alphabet[(value << (5 - (bits + offset))) & 31]
		}

		return output
	}

	decodeBananoBase32 = (input: string): Uint8Array => {
		const length = input.length
		const leftover = (length * 5) % 8
		const offset = leftover === 0 ? 0 : 8 - leftover

		let bits = 0
		let value = 0
		let index = 0
		let output = new Uint8Array(Math.ceil((length * 5) / 8))

		for (let i = 0; i < length; i++) {
			value = (value << 5) | this.readChar(input[i])
			bits += 5

			if (bits >= 8) {
				output[index++] = (value >>> (bits + offset - 8)) & 255
				bits -= 8
			}
		}

		if (bits > 0) {
			output[index++] = (value << (bits + offset - 8)) & 255
		}

		if (leftover !== 0) {
			output = output.slice(1)
		}

		return output
	}

	/**
	 * Validates a Banano address with 'ban' prefix
	 *
	 * Derived from https://github.com/alecrios/nano-address-validator
	 *
	 * @param {string} address Banano address
	 */
	validateBananoAddress = (address: string): boolean => {
		if (address === undefined) {
			throw Error('Address must be defined.')
		}

		if (typeof address !== 'string') {
			throw TypeError('Address must be a string.')
		}

		const allowedPrefixes: string[] = ['ban']
		const pattern = new RegExp(
			`^(${allowedPrefixes.join('|')})_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$`,
		)

		if (!pattern.test(address)) {
			return false
		}

		const expectedChecksum = address.slice(-8)
		const publicKey = address.slice(address.indexOf('_') + 1, -8)
		const publicKeyBuffer = this.decodeBananoBase32(publicKey)
		const actualChecksumBuffer = blake2b(publicKeyBuffer, null, 5).reverse()
		const actualChecksum = this.encodeBananoBase32(actualChecksumBuffer)

		return expectedChecksum === actualChecksum
	}

	readChar(char: string): number {
		const idx = this.alphabet.indexOf(char)

		if (idx === -1) {
			throw new Error(`Invalid character found: ${char}`)
		}

		return idx
	}

}
