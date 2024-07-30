import { AudioDecoder, EncodedAudioChunk } from '../../src/module';
import { spy, stub } from 'sinon';
import { KNOWN_AUDIO_CODECS } from '../../src/constants/known-audio-codecs';
import { filterSupportedAudioCodecsForDecoding } from '../helpers/filter-supported-audio-codecs-for-decoding';
import { loadFixtureAsArrayBuffer } from '../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../helpers/load-fixture-as-json';

const FLAC_DESCRIPTION = new Uint8Array([
    102, 76, 97, 67, 0, 0, 0, 34, 18, 0, 18, 0, 0, 0, 186, 0, 5, 57, 11, 184, 0, 240, 0, 3, 169, 128, 148, 172, 171, 223, 193, 198, 120,
    195, 117, 49, 236, 130, 87, 47, 118, 114
]).buffer;
const VORBIS_DESCRIPTION = new Uint8Array([
    2, 30, 62, 1, 118, 111, 114, 98, 105, 115, 0, 0, 0, 0, 1, 128, 187, 0, 0, 255, 255, 255, 255, 0, 119, 1, 0, 255, 255, 255, 255, 184, 1,
    3, 118, 111, 114, 98, 105, 115, 12, 0, 0, 0, 76, 97, 118, 102, 54, 49, 46, 49, 46, 49, 48, 48, 1, 0, 0, 0, 30, 0, 0, 0, 101, 110, 99,
    111, 100, 101, 114, 61, 76, 97, 118, 99, 54, 49, 46, 51, 46, 49, 48, 48, 32, 108, 105, 98, 118, 111, 114, 98, 105, 115, 1, 5, 118, 111,
    114, 98, 105, 115, 41, 66, 67, 86, 1, 0, 8, 0, 0, 0, 49, 76, 32, 197, 128, 208, 144, 85, 0, 0, 16, 0, 0, 96, 36, 41, 14, 147, 102, 73,
    41, 165, 148, 161, 40, 121, 152, 148, 72, 73, 41, 165, 148, 197, 48, 137, 152, 148, 137, 197, 24, 99, 140, 49, 198, 24, 99, 140, 49,
    198, 24, 99, 140, 32, 52, 100, 21, 0, 0, 4, 0, 128, 40, 9, 142, 163, 230, 73, 106, 206, 57, 103, 24, 39, 142, 114, 160, 57, 105, 78, 56,
    167, 32, 7, 138, 81, 224, 57, 9, 194, 245, 38, 99, 110, 166, 180, 166, 107, 110, 206, 41, 37, 8, 13, 89, 5, 0, 0, 2, 0, 64, 72, 33, 133,
    20, 82, 72, 33, 133, 20, 98, 136, 33, 134, 24, 98, 136, 33, 135, 28, 114, 200, 33, 167, 156, 114, 10, 42, 168, 160, 130, 10, 50, 200,
    32, 131, 76, 50, 233, 164, 147, 78, 58, 233, 168, 163, 142, 58, 234, 40, 180, 208, 66, 11, 45, 180, 210, 74, 76, 49, 213, 86, 99, 174,
    189, 6, 93, 124, 115, 206, 57, 231, 156, 115, 206, 57, 231, 156, 115, 206, 9, 66, 67, 86, 1, 0, 32, 0, 0, 4, 66, 6, 25, 100, 16, 66, 8,
    33, 133, 20, 82, 136, 41, 166, 152, 114, 10, 50, 200, 128, 208, 144, 85, 0, 0, 32, 0, 128, 0, 0, 0, 0, 71, 145, 20, 73, 177, 20, 203,
    177, 28, 205, 209, 36, 79, 242, 44, 81, 19, 53, 209, 51, 69, 83, 84, 77, 85, 85, 85, 85, 117, 93, 87, 118, 101, 215, 118, 117, 215, 118,
    125, 89, 152, 133, 91, 184, 125, 89, 184, 133, 91, 216, 133, 93, 247, 133, 97, 24, 134, 97, 24, 134, 97, 24, 134, 97, 248, 125, 223,
    247, 125, 223, 247, 125, 32, 52, 100, 21, 0, 32, 1, 0, 160, 35, 57, 150, 227, 41, 162, 34, 26, 162, 226, 57, 162, 3, 132, 134, 172, 2,
    0, 100, 0, 0, 4, 0, 32, 9, 146, 34, 41, 146, 163, 73, 166, 102, 106, 174, 105, 155, 182, 104, 171, 182, 109, 203, 178, 44, 203, 178, 12,
    132, 134, 172, 2, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 160, 105, 154, 166, 105, 154, 166, 105, 154, 166, 105, 154, 166, 105, 154, 166, 105,
    154, 166, 105, 154, 102, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101,
    89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89, 64, 104, 200, 42, 0, 64, 2, 0, 64, 199, 113, 28, 199, 113, 36, 69, 82, 36,
    199, 114, 44, 7, 8, 13, 89, 5, 0, 200, 0, 0, 8, 0, 64, 82, 44, 197, 114, 52, 71, 115, 52, 199, 115, 60, 199, 115, 60, 71, 116, 68, 201,
    148, 76, 205, 244, 76, 15, 8, 13, 89, 5, 0, 0, 2, 0, 8, 0, 0, 0, 0, 0, 64, 49, 28, 197, 113, 28, 201, 209, 36, 79, 82, 45, 211, 114, 53,
    87, 115, 61, 215, 115, 77, 215, 117, 93, 87, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85,
    85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 129, 208, 144, 85, 0, 0, 4, 0, 0, 33, 157, 102, 150, 106, 128, 8, 51, 144, 97, 32, 52, 100,
    21, 0, 128, 0, 0, 0, 24, 161, 8, 67, 12, 8, 13, 89, 5, 0, 0, 4, 0, 0, 136, 161, 228, 32, 154, 208, 154, 243, 205, 57, 14, 154, 229, 160,
    169, 20, 155, 211, 193, 137, 84, 155, 39, 185, 169, 152, 155, 115, 206, 57, 231, 156, 108, 206, 25, 227, 156, 115, 206, 41, 202, 153,
    197, 160, 153, 208, 154, 115, 206, 73, 12, 154, 165, 160, 153, 208, 154, 115, 206, 121, 18, 155, 7, 173, 169, 210, 154, 115, 206, 25,
    231, 156, 14, 198, 25, 97, 156, 115, 206, 105, 210, 154, 7, 169, 217, 88, 155, 115, 206, 89, 208, 154, 230, 168, 185, 20, 155, 115, 206,
    137, 148, 155, 39, 181, 185, 84, 155, 115, 206, 57, 231, 156, 115, 206, 57, 231, 156, 115, 206, 169, 94, 156, 206, 193, 57, 225, 156,
    115, 206, 137, 218, 155, 107, 185, 9, 93, 156, 115, 206, 249, 100, 156, 238, 205, 9, 225, 156, 115, 206, 57, 231, 156, 115, 206, 57,
    231, 156, 115, 206, 9, 66, 67, 86, 1, 0, 64, 0, 0, 4, 97, 216, 24, 198, 157, 130, 32, 125, 142, 6, 98, 20, 33, 166, 33, 147, 30, 116,
    143, 14, 147, 160, 49, 200, 41, 164, 30, 141, 142, 70, 74, 169, 131, 80, 82, 25, 39, 165, 116, 130, 208, 144, 85, 0, 0, 32, 0, 0, 132,
    16, 82, 72, 33, 133, 20, 82, 72, 33, 133, 20, 82, 72, 33, 134, 24, 98, 136, 33, 167, 156, 114, 10, 42, 168, 164, 146, 138, 42, 202, 40,
    179, 204, 50, 203, 44, 179, 204, 50, 203, 172, 195, 206, 58, 235, 176, 195, 16, 67, 12, 49, 180, 210, 74, 44, 53, 213, 86, 99, 141, 181,
    230, 158, 115, 174, 57, 72, 107, 165, 181, 214, 90, 43, 165, 148, 82, 74, 41, 165, 32, 52, 100, 21, 0, 0, 2, 0, 64, 32, 100, 144, 65, 6,
    25, 133, 20, 82, 72, 33, 134, 152, 114, 202, 41, 167, 160, 130, 10, 8, 13, 89, 5, 0, 0, 2, 0, 8, 0, 0, 0, 240, 36, 207, 17, 29, 209, 17,
    29, 209, 17, 29, 209, 17, 29, 209, 17, 29, 207, 241, 28, 81, 18, 37, 81, 18, 37, 209, 50, 45, 83, 51, 61, 85, 84, 85, 87, 118, 109, 89,
    151, 117, 219, 183, 133, 93, 216, 117, 223, 215, 125, 223, 215, 141, 95, 23, 134, 101, 89, 150, 101, 89, 150, 101, 89, 150, 101, 89,
    150, 101, 89, 150, 101, 9, 66, 67, 86, 1, 0, 32, 0, 0, 0, 66, 8, 33, 132, 20, 82, 72, 33, 133, 148, 98, 140, 49, 199, 156, 131, 78, 66,
    9, 129, 208, 144, 85, 0, 0, 32, 0, 128, 0, 0, 0, 0, 71, 113, 20, 199, 145, 28, 201, 145, 36, 75, 178, 36, 77, 210, 44, 205, 242, 52, 79,
    243, 52, 209, 19, 69, 81, 52, 77, 83, 21, 93, 209, 21, 117, 211, 22, 101, 83, 54, 93, 211, 53, 101, 211, 85, 101, 213, 118, 101, 217,
    182, 101, 91, 183, 125, 89, 182, 125, 223, 247, 125, 223, 247, 125, 223, 247, 125, 223, 247, 125, 223, 215, 117, 32, 52, 100, 21, 0, 32,
    1, 0, 160, 35, 57, 146, 34, 41, 146, 34, 57, 142, 227, 72, 146, 4, 132, 134, 172, 2, 0, 100, 0, 0, 4, 0, 160, 40, 142, 226, 56, 142, 35,
    73, 146, 36, 89, 146, 38, 121, 150, 103, 137, 154, 169, 153, 158, 233, 169, 162, 10, 132, 134, 172, 2, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0,
    160, 104, 138, 167, 152, 138, 167, 136, 138, 231, 136, 142, 40, 137, 150, 105, 137, 154, 170, 185, 162, 108, 202, 174, 235, 186, 174,
    235, 186, 174, 235, 186, 174, 235, 186, 174, 235, 186, 174, 235, 186, 174, 235, 186, 174, 235, 186, 174, 235, 186, 174, 235, 186, 174,
    235, 186, 174, 235, 186, 64, 104, 200, 42, 0, 64, 2, 0, 64, 71, 114, 36, 71, 114, 36, 69, 82, 36, 69, 114, 36, 7, 8, 13, 89, 5, 0, 200,
    0, 0, 8, 0, 192, 49, 28, 67, 82, 36, 199, 178, 44, 77, 243, 52, 79, 243, 52, 209, 19, 61, 209, 51, 61, 85, 116, 69, 23, 8, 13, 89, 5, 0,
    0, 2, 0, 8, 0, 0, 0, 0, 0, 192, 144, 12, 75, 177, 28, 205, 209, 36, 81, 82, 45, 213, 82, 53, 213, 82, 45, 85, 84, 61, 85, 85, 85, 85,
    85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 85, 213, 52, 77, 211,
    52, 129, 208, 144, 149, 0, 0, 25, 0, 0, 35, 65, 6, 25, 132, 16, 138, 114, 144, 66, 110, 61, 88, 8, 49, 230, 36, 5, 161, 57, 6, 161, 196,
    24, 132, 167, 16, 51, 12, 57, 13, 34, 116, 144, 65, 39, 61, 184, 146, 57, 195, 12, 243, 224, 82, 40, 21, 68, 76, 131, 141, 37, 55, 142,
    32, 13, 194, 166, 92, 73, 229, 56, 8, 66, 67, 86, 4, 0, 81, 0, 0, 128, 49, 200, 49, 196, 24, 114, 206, 73, 201, 160, 68, 206, 49, 9,
    157, 148, 200, 57, 39, 165, 147, 210, 73, 41, 45, 150, 24, 51, 41, 37, 166, 18, 99, 227, 156, 163, 210, 73, 201, 164, 148, 24, 75, 138,
    157, 164, 18, 99, 137, 173, 0, 0, 128, 0, 7, 0, 128, 0, 11, 161, 208, 144, 21, 1, 64, 20, 0, 0, 98, 12, 82, 10, 41, 133, 148, 82, 206,
    41, 230, 144, 82, 202, 49, 229, 28, 82, 74, 57, 167, 156, 83, 206, 57, 8, 29, 132, 202, 49, 6, 157, 131, 16, 41, 165, 28, 83, 206, 41,
    199, 28, 132, 204, 65, 229, 156, 131, 208, 65, 40, 0, 0, 32, 192, 1, 0, 32, 192, 66, 40, 52, 100, 69, 0, 16, 39, 0, 224, 112, 36, 207,
    147, 52, 75, 20, 37, 75, 19, 69, 207, 20, 101, 215, 19, 77, 215, 149, 52, 205, 52, 53, 81, 84, 85, 203, 19, 85, 213, 84, 85, 219, 22,
    77, 85, 182, 37, 77, 19, 77, 77, 244, 84, 85, 19, 69, 85, 21, 85, 211, 150, 77, 85, 181, 109, 207, 52, 101, 217, 84, 85, 221, 22, 85,
    213, 182, 101, 219, 22, 126, 87, 150, 117, 223, 51, 77, 89, 22, 85, 213, 214, 77, 85, 181, 117, 215, 150, 125, 95, 214, 109, 93, 152,
    52, 205, 52, 53, 81, 84, 85, 77, 20, 85, 213, 84, 85, 219, 54, 85, 215, 182, 53, 81, 116, 85, 81, 85, 101, 89, 84, 85, 89, 118, 101, 89,
    247, 85, 87, 214, 125, 75, 20, 85, 213, 83, 77, 217, 21, 85, 85, 182, 85, 217, 245, 109, 85, 150, 125, 225, 116, 85, 93, 87, 101, 217,
    247, 85, 89, 22, 126, 91, 215, 133, 225, 246, 125, 225, 24, 85, 213, 214, 77, 215, 213, 117, 85, 150, 125, 97, 214, 101, 97, 183, 117,
    223, 40, 105, 154, 105, 106, 162, 168, 170, 154, 40, 170, 170, 169, 170, 182, 109, 170, 174, 173, 91, 162, 232, 170, 162, 170, 202, 178,
    103, 170, 174, 172, 202, 178, 175, 171, 174, 108, 235, 154, 40, 170, 174, 168, 170, 178, 44, 170, 170, 44, 171, 178, 172, 251, 170, 44,
    235, 182, 168, 170, 186, 173, 202, 178, 176, 155, 174, 171, 235, 182, 239, 11, 195, 44, 235, 186, 112, 170, 174, 174, 171, 178, 236,
    251, 170, 44, 235, 186, 173, 235, 198, 113, 235, 186, 48, 124, 166, 41, 203, 166, 171, 234, 186, 169, 186, 186, 110, 235, 186, 113, 204,
    182, 109, 28, 163, 170, 234, 190, 42, 203, 194, 176, 202, 178, 239, 235, 186, 47, 180, 117, 33, 81, 85, 117, 221, 148, 93, 227, 87, 101,
    89, 247, 109, 95, 119, 158, 91, 247, 133, 178, 109, 59, 191, 173, 251, 202, 113, 235, 186, 210, 248, 57, 207, 111, 28, 185, 182, 109,
    28, 179, 110, 27, 191, 173, 251, 198, 243, 43, 63, 97, 56, 142, 165, 103, 154, 182, 109, 170, 170, 173, 155, 170, 171, 235, 178, 110,
    43, 195, 172, 235, 66, 81, 85, 125, 93, 149, 101, 223, 55, 93, 89, 23, 110, 223, 55, 142, 91, 215, 141, 162, 170, 234, 186, 42, 203,
    190, 176, 202, 178, 49, 220, 198, 111, 28, 187, 48, 28, 93, 219, 54, 142, 91, 215, 157, 178, 173, 11, 125, 99, 200, 247, 9, 207, 107,
    219, 198, 113, 251, 58, 227, 246, 117, 163, 175, 12, 9, 199, 143, 0, 0, 128, 1, 7, 0, 128, 0, 19, 202, 64, 161, 33, 43, 2, 128, 56, 1,
    0, 6, 33, 231, 20, 83, 16, 42, 197, 32, 116, 16, 82, 234, 32, 164, 84, 49, 6, 33, 115, 78, 74, 197, 28, 148, 80, 74, 106, 33, 148, 212,
    42, 198, 32, 84, 142, 73, 200, 156, 147, 18, 74, 104, 41, 148, 210, 82, 7, 161, 165, 80, 74, 107, 161, 148, 214, 82, 107, 177, 166, 212,
    98, 237, 32, 164, 22, 74, 105, 45, 148, 210, 90, 106, 169, 198, 212, 90, 140, 17, 99, 16, 50, 231, 164, 100, 206, 73, 9, 165, 180, 22,
    74, 105, 45, 115, 78, 74, 231, 160, 164, 14, 66, 74, 165, 164, 20, 75, 74, 45, 86, 204, 73, 201, 160, 163, 210, 65, 72, 169, 164, 18,
    83, 73, 169, 181, 80, 74, 107, 165, 164, 22, 75, 74, 49, 182, 20, 91, 110, 49, 214, 28, 74, 105, 45, 164, 18, 91, 73, 41, 198, 20, 83,
    109, 45, 198, 154, 35, 198, 32, 100, 206, 73, 201, 156, 147, 18, 74, 105, 45, 148, 210, 90, 229, 152, 148, 14, 66, 74, 153, 131, 146,
    74, 74, 173, 149, 146, 82, 204, 156, 147, 210, 65, 72, 169, 131, 142, 74, 73, 41, 182, 146, 74, 76, 161, 148, 214, 74, 74, 177, 133, 82,
    90, 108, 49, 214, 156, 82, 108, 53, 148, 210, 90, 73, 41, 198, 146, 74, 108, 45, 198, 90, 91, 76, 181, 117, 16, 90, 11, 165, 180, 22,
    74, 105, 173, 181, 86, 107, 106, 173, 198, 80, 74, 107, 37, 165, 24, 75, 74, 177, 181, 22, 107, 110, 49, 230, 26, 74, 105, 173, 164, 18,
    91, 73, 169, 197, 22, 91, 142, 45, 198, 154, 83, 107, 53, 166, 214, 106, 110, 49, 230, 26, 91, 109, 61, 214, 154, 115, 74, 173, 214,
    212, 82, 141, 45, 198, 154, 99, 109, 189, 213, 154, 123, 239, 32, 164, 22, 74, 105, 45, 148, 210, 98, 106, 45, 198, 214, 98, 173, 161,
    148, 214, 74, 42, 177, 149, 146, 90, 108, 49, 230, 218, 90, 140, 57, 148, 210, 98, 73, 169, 197, 146, 82, 140, 45, 198, 154, 91, 108,
    185, 166, 150, 106, 108, 49, 230, 154, 82, 139, 181, 230, 218, 115, 108, 53, 246, 212, 90, 172, 45, 198, 154, 83, 75, 181, 214, 90, 115,
    143, 185, 245, 86, 0, 0, 192, 128, 3, 0, 64, 128, 9, 101, 160, 208, 144, 149, 0, 64, 20, 0, 0, 65, 136, 82, 206, 73, 105, 16, 114, 204,
    57, 42, 9, 66, 204, 57, 39, 169, 114, 76, 66, 41, 41, 85, 204, 65, 8, 37, 181, 206, 57, 41, 41, 197, 214, 57, 8, 37, 165, 22, 75, 42,
    45, 197, 86, 107, 41, 41, 181, 22, 107, 45, 0, 0, 160, 192, 1, 0, 32, 192, 6, 77, 137, 197, 1, 10, 13, 89, 9, 0, 68, 1, 0, 32, 198, 32,
    196, 24, 132, 6, 25, 165, 24, 131, 208, 24, 164, 20, 99, 16, 34, 165, 24, 115, 78, 74, 165, 20, 99, 206, 73, 201, 24, 115, 14, 66, 42,
    25, 99, 206, 65, 40, 41, 132, 80, 74, 42, 41, 133, 16, 74, 73, 37, 165, 2, 0, 0, 10, 28, 0, 0, 2, 108, 208, 148, 88, 28, 160, 208, 144,
    21, 1, 64, 20, 0, 0, 96, 12, 98, 12, 49, 134, 32, 116, 84, 50, 42, 17, 132, 76, 74, 39, 169, 129, 16, 90, 11, 173, 117, 214, 82, 107,
    165, 197, 204, 90, 106, 173, 180, 216, 64, 8, 173, 133, 214, 50, 75, 37, 198, 212, 90, 102, 173, 196, 152, 90, 43, 0, 0, 236, 192, 1, 0,
    236, 192, 66, 40, 52, 100, 37, 0, 144, 7, 0, 64, 24, 163, 20, 99, 206, 57, 103, 16, 98, 204, 57, 232, 28, 52, 8, 49, 230, 28, 132, 14,
    42, 198, 156, 131, 14, 66, 8, 21, 99, 206, 65, 8, 33, 132, 204, 57, 8, 33, 132, 16, 66, 230, 28, 132, 16, 66, 8, 161, 131, 16, 66, 8,
    165, 148, 210, 65, 8, 33, 132, 82, 74, 233, 32, 132, 16, 66, 41, 165, 116, 16, 66, 8, 161, 148, 82, 10, 0, 0, 42, 112, 0, 0, 8, 176, 81,
    100, 115, 130, 145, 160, 66, 67, 86, 2, 0, 121, 0, 0, 128, 49, 74, 57, 7, 161, 148, 70, 41, 198, 32, 148, 146, 82, 163, 20, 99, 16, 74,
    73, 169, 114, 12, 66, 41, 41, 197, 86, 57, 7, 161, 148, 148, 90, 236, 32, 148, 210, 90, 108, 53, 118, 16, 74, 105, 45, 198, 90, 67, 74,
    173, 197, 88, 107, 174, 33, 165, 214, 98, 172, 53, 215, 212, 90, 140, 181, 230, 154, 107, 74, 45, 198, 90, 107, 205, 185, 0, 0, 220, 5,
    7, 0, 176, 3, 27, 69, 54, 39, 24, 9, 42, 52, 100, 37, 0, 144, 7, 0, 128, 32, 164, 20, 99, 140, 49, 134, 20, 98, 138, 49, 231, 156, 67,
    8, 41, 197, 152, 115, 206, 41, 166, 24, 115, 206, 57, 231, 148, 98, 140, 57, 231, 156, 115, 140, 49, 231, 156, 115, 206, 57, 198, 152,
    115, 206, 57, 231, 28, 115, 206, 57, 231, 156, 115, 142, 57, 231, 156, 115, 206, 57, 231, 156, 115, 206, 57, 231, 156, 115, 206, 57,
    231, 156, 115, 206, 9, 0, 0, 42, 112, 0, 0, 8, 176, 81, 100, 115, 130, 145, 160, 66, 67, 86, 2, 0, 169, 0, 0, 0, 17, 86, 98, 140, 49,
    198, 24, 27, 8, 49, 198, 24, 99, 140, 49, 70, 18, 98, 140, 49, 198, 24, 99, 108, 49, 198, 24, 99, 140, 49, 198, 152, 98, 140, 49, 198,
    24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24,
    99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 99, 140, 49, 198, 24, 91, 107, 173, 181, 214, 90, 107, 173, 181, 214,
    90, 107, 173, 181, 214, 90, 107, 173, 0, 64, 191, 10, 7, 0, 255, 7, 27, 86, 71, 56, 41, 26, 11, 44, 52, 100, 37, 0, 16, 14, 0, 0, 24,
    195, 152, 115, 142, 57, 6, 29, 132, 134, 41, 232, 164, 132, 14, 66, 8, 161, 67, 74, 57, 40, 37, 132, 80, 74, 41, 41, 115, 78, 74, 74,
    165, 164, 148, 90, 74, 153, 115, 82, 82, 42, 37, 165, 150, 82, 234, 32, 164, 212, 90, 74, 45, 181, 214, 90, 7, 37, 165, 214, 82, 106,
    173, 181, 214, 58, 8, 165, 180, 212, 90, 107, 173, 181, 216, 65, 72, 41, 165, 214, 90, 139, 45, 198, 80, 74, 74, 173, 181, 216, 98, 140,
    53, 134, 82, 82, 106, 173, 197, 216, 98, 172, 49, 164, 210, 82, 108, 45, 198, 24, 99, 172, 161, 148, 214, 90, 107, 49, 198, 24, 107, 45,
    41, 181, 214, 98, 140, 181, 198, 90, 107, 73, 169, 181, 214, 98, 139, 53, 214, 90, 11, 0, 224, 110, 112, 0, 128, 72, 176, 113, 134, 149,
    164, 179, 194, 209, 224, 66, 67, 86, 2, 0, 33, 1, 0, 4, 66, 140, 57, 231, 156, 115, 16, 66, 8, 33, 82, 138, 49, 231, 160, 131, 16, 66,
    8, 33, 68, 74, 49, 230, 28, 116, 16, 66, 8, 33, 132, 140, 49, 231, 160, 131, 16, 66, 8, 33, 132, 144, 49, 230, 28, 116, 16, 66, 8, 33,
    132, 16, 58, 231, 28, 132, 16, 66, 8, 161, 132, 82, 74, 231, 28, 116, 16, 66, 8, 33, 148, 80, 66, 233, 32, 132, 16, 66, 8, 161, 132, 82,
    74, 41, 29, 132, 16, 66, 40, 161, 132, 82, 74, 41, 37, 132, 16, 66, 9, 165, 148, 82, 74, 41, 165, 132, 16, 66, 8, 161, 132, 18, 74, 41,
    165, 148, 16, 66, 8, 165, 148, 82, 74, 41, 165, 148, 18, 66, 8, 33, 148, 82, 74, 41, 165, 148, 82, 66, 8, 161, 148, 80, 74, 41, 165,
    148, 82, 74, 8, 33, 132, 82, 74, 41, 165, 148, 82, 74, 9, 33, 132, 80, 74, 41, 165, 148, 82, 74, 41, 33, 132, 18, 74, 41, 165, 148, 82,
    74, 41, 165, 0, 0, 128, 3, 7, 0, 128, 0, 35, 232, 36, 163, 202, 34, 108, 52, 225, 194, 3, 80, 104, 200, 74, 0, 128, 12, 0, 0, 113, 216,
    106, 235, 41, 214, 200, 32, 197, 156, 132, 150, 75, 132, 144, 114, 16, 98, 46, 17, 82, 138, 57, 71, 177, 101, 72, 25, 197, 24, 213, 148,
    49, 165, 20, 83, 82, 107, 232, 156, 98, 140, 81, 79, 157, 99, 74, 49, 195, 172, 148, 86, 74, 40, 145, 130, 210, 114, 172, 181, 118, 204,
    1, 0, 0, 32, 8, 0, 48, 16, 33, 51, 129, 64, 1, 20, 24, 200, 0, 128, 3, 132, 4, 41, 0, 160, 176, 192, 208, 49, 92, 4, 4, 228, 18, 50, 10,
    12, 10, 199, 132, 115, 210, 105, 3, 0, 16, 132, 200, 12, 145, 136, 88, 12, 18, 19, 170, 129, 162, 98, 58, 0, 88, 92, 96, 200, 7, 128,
    12, 141, 141, 180, 139, 11, 232, 50, 192, 5, 93, 220, 117, 32, 132, 32, 4, 33, 136, 197, 1, 20, 144, 128, 131, 19, 110, 120, 226, 13,
    79, 184, 193, 9, 58, 69, 165, 14, 2, 0, 0, 0, 0, 224, 0, 0, 30, 0, 0, 146, 13, 32, 34, 34, 154, 57, 142, 14, 143, 15, 144, 16, 145, 17,
    146, 18, 147, 19, 148, 0, 0, 0, 0, 0, 176, 1, 128, 15, 0, 128, 36, 5, 136, 136, 136, 102, 142, 163, 195, 227, 3, 36, 68, 100, 132, 164,
    196, 228, 4, 37, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 0, 0, 0, 0, 0, 4, 0, 0, 0, 8, 8
]).buffer;

describe('AudioDecoder', () => {
    let error;
    let output;

    beforeEach(() => {
        error = stub();
        output = stub();

        error.throws(new Error('error: This should never be called.'));
        output.throws(new Error('output: This should never be called.'));
    });

    describe('isConfigSupported()', () => {
        describe('with an empty codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: '' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with an unknown codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: 'bogus' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a video codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: 'vp8' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with an ambiguous codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: 'vp9' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a MIME type as codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: "audio/webm; codecs='opus'" }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a known codec', () => {
            for (const codec of KNOWN_AUDIO_CODECS) {
                describe(`with "${codec}"`, () => {
                    let config;

                    beforeEach(() => {
                        if (codec === 'flac') {
                            config = {
                                codec,
                                description: FLAC_DESCRIPTION,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        } else if (codec === 'vorbis') {
                            config = {
                                codec,
                                description: VORBIS_DESCRIPTION,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        } else {
                            config = {
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        }

                        error.resetBehavior();
                    });

                    describe('with a valid AudioDecoderConfig', () => {
                        let supported;

                        beforeEach(() => {
                            supported = filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec);
                        });

                        it('should return an AudioDecoderSupport object', async () => {
                            config.some = 'other property';

                            const audioDecoderSupport = await AudioDecoder.isConfigSupported(config);

                            delete config.some;

                            expect(audioDecoderSupport.config).to.not.equal(config);
                            expect(audioDecoderSupport).to.deep.equal({ config, supported });
                        });
                    });
                });
            }
        });
    });

    describe('constructor()', () => {
        describe('with valid options', () => {
            let audioDecoder;

            beforeEach(() => {
                audioDecoder = new AudioDecoder({
                    error,
                    output
                });
            });

            it('should return an instance of the AudioDecoder constructor', () => {
                expect(audioDecoder).to.be.an.instanceOf(AudioDecoder);

                expect(audioDecoder.close).to.be.a('function');
                expect(audioDecoder.configure).to.be.a('function');
                expect(audioDecoder.decode).to.be.a('function');
                expect(audioDecoder.decodeQueueSize).to.equal(0);
                expect(audioDecoder.flush).to.be.a('function');
                expect(audioDecoder.ondequeue).to.be.null;
                expect(audioDecoder.reset).to.be.a('function');
                expect(audioDecoder.state).to.equal('unconfigured');
            });

            it('should return an implementation of the EventTarget constructor', () => {
                expect(audioDecoder).to.be.an.instanceOf(EventTarget);

                expect(audioDecoder.addEventListener).to.be.a('function');
                expect(audioDecoder.dispatchEvent).to.be.a('function');
                expect(audioDecoder.removeEventListener).to.be.a('function');
            });
        });

        describe('with invalid options', () => {
            describe('with a missing error callback', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioDecoder({ output })).to.throw(TypeError);
                });
            });

            describe('with a missing output callback', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioDecoder({ error })).to.throw(TypeError);
                });
            });

            describe('with no callback at all', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioDecoder({})).to.throw(TypeError);
                });
            });
        });
    });

    describe('ondequeue', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        it('should be null', () => {
            expect(audioDecoder.ondequeue).to.be.null;
        });

        it('should be assignable to a function', () => {
            const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
            const ondequeue = (audioDecoder.ondequeue = fn); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.equal(fn);
            expect(audioDecoder.ondequeue).to.equal(fn);
        });

        it('should be assignable to null', () => {
            const ondequeue = (audioDecoder.ondequeue = null); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.be.null;
            expect(audioDecoder.ondequeue).to.be.null;
        });

        it('should not be assignable to something else', () => {
            const string = 'no function or null value';

            audioDecoder.ondequeue = () => {};

            const ondequeue = (audioDecoder.ondequeue = string); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.equal(string);
            expect(audioDecoder.ondequeue).to.be.null;
        });

        it('should register an independent event listener', () => {
            const ondequeue = spy();

            audioDecoder.ondequeue = ondequeue;
            audioDecoder.addEventListener('dequeue', ondequeue);

            audioDecoder.dispatchEvent(new Event('dequeue'));

            expect(ondequeue).to.have.been.calledTwice;
        });
    });

    describe('close()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it("should set the state to 'closed'", () => {
                audioDecoder.close();

                expect(audioDecoder.state).to.equal('closed');
            });
        });

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            if (codec === 'flac') {
                                audioDecoder.configure({
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else if (codec === 'vorbis') {
                                audioDecoder.configure({
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else {
                                audioDecoder.configure({
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            }
                        });

                        it("should set the state to 'closed'", () => {
                            audioDecoder.close();

                            expect(audioDecoder.state).to.equal('closed');
                        });
                    });
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.close();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('configure()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            describe('with an empty codec', () => {
                let codec;

                beforeEach(() => (codec = ''));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with an unknown codec', () => {
                let codec;

                beforeEach(() => (codec = 'bogus'));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a video codec', () => {
                let codec;

                beforeEach(() => (codec = 'vp8'));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with an ambiguous codec', () => {
                let codec;

                beforeEach(() => (codec = 'vp9'));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a MIME type as codec', () => {
                let codec;

                beforeEach(() => (codec = "audio/webm; codecs='opus'"));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a known codec', () => {
                for (const codec of KNOWN_AUDIO_CODECS) {
                    describe(`with "${codec}"`, () => {
                        let config;

                        beforeEach(() => {
                            if (codec === 'flac') {
                                config = {
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else if (codec === 'vorbis') {
                                config = {
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else {
                                config = {
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            }

                            error.resetBehavior();
                        });

                        if (filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec)) {
                            it('should not trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.not.been.called;
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('configured');
                            });
                        } else {
                            it('should trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.been.calledOnce;

                                const { args } = error.getCall(0);

                                expect(args.length).to.equal(1);
                                expect(args[0].code).to.equal(9);
                                expect(args[0].name).to.equal('NotSupportedError');
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('closed');
                            });
                        }
                    });
                }
            });
        });

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        let config;

                        beforeEach(async () => {
                            if (codec === 'flac') {
                                config = {
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else if (codec === 'vorbis') {
                                config = {
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else {
                                config = {
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            }

                            audioDecoder.configure(config);

                            await new Promise((resolve) => {
                                setTimeout(resolve);
                            });

                            error.resetBehavior();
                        });

                        if (filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec)) {
                            it('should not trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.not.been.called;
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('configured');
                            });
                        } else {
                            it('should trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.been.calledOnce;

                                const { args } = error.getCall(0);

                                expect(args.length).to.equal(1);
                                expect(args[0].code).to.equal(9);
                                expect(args[0].name).to.equal('NotSupportedError');
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('closed');
                            });
                        }
                    });
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.configure({
                        codec: 'mp4a.40.2',
                        numberOfChannels: 1,
                        sampleRate: 48000
                    });
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('decode()', () => {
        let audioDecoder;
        let encodedAudioChunk;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
            encodedAudioChunk = new EncodedAudioChunk({ data: Uint8Array.of(0), timestamp: 0, type: 'key' });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.decode(encodedAudioChunk);
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });

        describe('with a configured AudioDecoder', () => {
            beforeEach(() => {
                output.resetBehavior();
            });

            describe('with a known and supported codec', () => {
                for (const [codec, container, format] of filterSupportedAudioCodecsForDecoding(
                    KNOWN_AUDIO_CODECS.filter(
                        (knownAudioCodec) =>
                            !['mp4a.40.02', 'mp4a.40.05', 'mp4a.40.29', 'mp4a.40.5', 'mp4a.67', 'mp4a.69', 'mp4a.6B'].includes(
                                knownAudioCodec
                            )
                    ),
                    navigator.userAgent
                )
                    .map((knownAudioCodec) =>
                        knownAudioCodec === 'mp4a.40.2'
                            ? [
                                  [knownAudioCodec, 'aac', 'f32-planar'],
                                  [knownAudioCodec, 'mp4', 'f32-planar']
                              ]
                            : knownAudioCodec === 'alaw'
                              ? [[knownAudioCodec, 'wav', 's16']]
                              : knownAudioCodec === 'flac'
                                ? [[knownAudioCodec, 'flac', 's16']]
                                : knownAudioCodec === 'mp3'
                                  ? [[knownAudioCodec, 'mp3', 's16-planar']]
                                  : knownAudioCodec === 'opus'
                                    ? [[knownAudioCodec, 'ogg', 'f32']]
                                    : knownAudioCodec === 'ulaw'
                                      ? [[knownAudioCodec, 'wav', 's16']]
                                      : knownAudioCodec === 'vorbis'
                                        ? [[knownAudioCodec, 'ogg', 'f32-planar']]
                                        : null
                    )
                    .flat()) {
                    describe(`with "${codec}" wrapped in "${container}"`, () => {
                        let decodedArrayBuffer;
                        let encodedArrayBuffer;
                        let json;

                        beforeEach(async () => {
                            const escapedCodec = codec.replaceAll('.', '-');

                            [decodedArrayBuffer, encodedArrayBuffer, json] = await Promise.all([
                                loadFixtureAsArrayBuffer(`sine-${escapedCodec}.${format}.wav`),
                                loadFixtureAsArrayBuffer(`sine-${escapedCodec}.${container}`),
                                loadFixtureAsJson(`sine-${escapedCodec}.${container}.json`)
                            ]);

                            if (codec === 'vorbis') {
                                audioDecoder.configure({ ...json.config, description: VORBIS_DESCRIPTION });
                            } else if (json.config.description === undefined) {
                                audioDecoder.configure(json.config);
                            } else {
                                audioDecoder.configure({
                                    ...json.config,
                                    description: encodedArrayBuffer.slice(...json.config.description)
                                });
                            }
                        });

                        it('should emit multiple instances of the AudioData constructor', async () => {
                            json.encodedAudioChunks.reduce((timestamp, { data, duration }) => {
                                audioDecoder.decode(
                                    new EncodedAudioChunk({
                                        data: encodedArrayBuffer.slice(...data),
                                        duration,
                                        timestamp,
                                        type: 'key'
                                    })
                                );

                                return timestamp + duration;
                            }, 0);

                            await audioDecoder.flush();

                            const calls = output.getCalls();

                            expect(calls.length).to.equal(json.audioDatas.length);

                            calls.reduce((timestamp, call, index) => {
                                expect(call.args.length).to.equal(1);

                                const [audioData] = call.args;
                                const { data, duration, numberOfFrames } = json.audioDatas[index];

                                expect(audioData.duration).to.equal(duration);
                                expect(audioData.format).to.equal(format);
                                expect(audioData.numberOfChannels).to.equal(1);
                                expect(audioData.numberOfFrames).to.equal(numberOfFrames);
                                expect(audioData.sampleRate).to.equal(48000);

                                if (codec === 'flac' && [4128000].includes(timestamp)) {
                                    expect(audioData.timestamp).to.equal(timestamp - 1);
                                } else if (
                                    codec === 'mp3' &&
                                    [1032000, 2064000, 2088000, 4104000, 4128000, 4152000, 4176000].includes(timestamp)
                                ) {
                                    expect(audioData.timestamp).to.equal(timestamp - 1);
                                } else if (codec === 'mp4a.40.2' && [4160000].includes(timestamp)) {
                                    expect(audioData.timestamp).to.equal(timestamp - 1);
                                } else if (
                                    codec === 'opus' &&
                                    [513500, 1033500, 2053500, 2073500, 2093500, 4113500, 4133500, 4153500, 4173500, 4193500].includes(
                                        timestamp
                                    )
                                ) {
                                    expect(audioData.timestamp).to.equal(timestamp - 1);
                                } else if (codec === 'vorbis' && [524000, 1036000, 2060000, 4108000, 4172000].includes(timestamp)) {
                                    expect(audioData.timestamp).to.equal(timestamp - 1);
                                } else {
                                    expect(audioData.timestamp).to.equal(timestamp);
                                }

                                // eslint-disable-next-line no-undef
                                if (!process.env.CI) {
                                    const uint8Array = new Uint8Array(audioData.allocationSize({ planeIndex: 0 }));

                                    audioData.copyTo(uint8Array, { planeIndex: 0 });

                                    expect(Array.from(uint8Array)).to.deep.equal(
                                        Array.from(new Uint8Array(decodedArrayBuffer.slice(...data)))
                                    );
                                }

                                return (timestamp + duration).toString().endsWith('999') ? timestamp + duration + 1 : timestamp + duration;
                            }, 0);
                        });
                    });
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.decode(encodedAudioChunk);
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('flush()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it('should throw an InvalidStateError', (done) => {
                audioDecoder.flush().catch((err) => {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                });
            });
        });

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            if (codec === 'flac') {
                                audioDecoder.configure({
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else if (codec === 'vorbis') {
                                audioDecoder.configure({
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else {
                                audioDecoder.configure({
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            }
                        });

                        it('should resolve to undefined', async () => {
                            expect(await audioDecoder.flush()).to.be.undefined;
                        });
                    });
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                audioDecoder.flush().catch((err) => {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                });
            });
        });
    });

    describe('reset()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it('should not change the state', () => {
                audioDecoder.reset();

                expect(audioDecoder.state).to.equal('unconfigured');
            });
        });

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            if (codec === 'flac') {
                                audioDecoder.configure({
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else if (codec === 'vorbis') {
                                audioDecoder.configure({
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else {
                                audioDecoder.configure({
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            }
                        });

                        it("should set the state to 'unconfigured'", () => {
                            audioDecoder.reset();

                            expect(audioDecoder.state).to.equal('unconfigured');
                        });
                    });
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.reset();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });

            it('should not change the state', (done) => {
                try {
                    audioDecoder.reset();
                } catch {
                    expect(audioDecoder.state).to.equal('closed');

                    done();
                }
            });
        });
    });
});
