const path = require("path");

module.exports = ({ types }, options) => {
    return {
        visitor: {
            JSXOpeningElement(astPath, state) {
                // 当前 pwd  默认 src
                const cwd = state.file?.opts?.cwd || "src";

                // 可能出现 /a/b/src/c/d/src/e/src 情况
                const [first, ...rest] = state.file?.opts?.filename.split(cwd)

                let fileName = rest.join("")
                // 去掉绝对路径
                fileName = fileName.startsWith("/") ? fileName.slice(1) : fileName

                const comLine =
                    astPath?.get?.("loc")?.get?.("start")?.get?.("line")?.node ?? ""

                // 渲染的文件
                const newPropRenderFileName = types.jSXAttribute(
                    types.jSXIdentifier("render-file-name"),
                    types.stringLiteral(fileName ?? "")
                )

                // 当前的 行
                const newPropComponentLine = types.jSXAttribute(
                    types.jSXIdentifier("line"),
                    types.stringLiteral(String(comLine) ?? "")
                )

                astPath.node.attributes.unshift(
                    newPropRenderFileName,
                    newPropComponentLine
                )
            },
        },
    }
}